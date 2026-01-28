import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
});

export const userRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()
  // Get user profile by username
  .get("/:username", async (c) => {
    const username = c.req.param("username");
    const db = c.env.DB;

    const user = await db
      .prepare(
        `SELECT id, username, display_name, bio, avatar_url, created_at,
                (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following_count,
                (SELECT COUNT(*) FROM tweets WHERE user_id = users.id) as tweets_count
         FROM users
         WHERE username = ?`
      )
      .bind(username)
      .first();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  })
  // Get user's tweets
  .get("/:username/tweets", async (c) => {
    const username = c.req.param("username");
    const limit = parseInt(c.req.query("limit") || "20");
    const cursor = c.req.query("cursor");
    const db = c.env.DB;

    // Get user id
    const user = await db
      .prepare("SELECT id FROM users WHERE username = ?")
      .bind(username)
      .first<{ id: string }>();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    let query = `
      SELECT t.id, t.user_id, t.content, t.images, t.created_at, t.updated_at,
             u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
             (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count
      FROM tweets t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `;

    const params: (string | number)[] = [user.id];

    if (cursor) {
      query += " AND t.created_at < ?";
      params.push(cursor);
    }

    query += " ORDER BY t.created_at DESC LIMIT ?";
    params.push(limit + 1);

    const results = await db
      .prepare(query)
      .bind(...params)
      .all<Record<string, unknown>>();

    const tweets = results.results || [];
    const hasMore = tweets.length > limit;
    const items = hasMore ? tweets.slice(0, -1) : tweets;
    const nextCursor = hasMore
      ? (items[items.length - 1] as { created_at: string }).created_at
      : null;

    // Parse images JSON for each tweet
    const parsedTweets = items.map((tweet) => ({
      ...tweet,
      images: tweet.images ? JSON.parse(tweet.images as string) : [],
    }));

    return c.json({ tweets: parsedTweets, nextCursor });
  })
  // Update current user's profile (protected)
  .put("/me", authMiddleware, zValidator("json", updateProfileSchema), async (c) => {
    const updates = c.req.valid("json");
    const user = c.get("user");
    const db = c.env.DB;

    const setClauses: string[] = [];
    const params: (string | undefined)[] = [];

    if (updates.displayName !== undefined) {
      setClauses.push("display_name = ?");
      params.push(updates.displayName);
    }
    if (updates.bio !== undefined) {
      setClauses.push("bio = ?");
      params.push(updates.bio);
    }
    if (updates.avatarUrl !== undefined) {
      setClauses.push("avatar_url = ?");
      params.push(updates.avatarUrl);
    }

    if (setClauses.length > 0) {
      setClauses.push("updated_at = datetime('now')");
      params.push(user.id);

      await db
        .prepare(
          `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`
        )
        .bind(...params)
        .run();
    }

    const updated = await db
      .prepare(
        "SELECT id, username, email, display_name, bio, avatar_url FROM users WHERE id = ?"
      )
      .bind(user.id)
      .first();

    return c.json({ user: updated });
  })
  // Follow a user (protected)
  .post("/:username/follow", authMiddleware, async (c) => {
    const username = c.req.param("username");
    const currentUser = c.get("user");
    const db = c.env.DB;

    // Get user to follow
    const userToFollow = await db
      .prepare("SELECT id FROM users WHERE username = ?")
      .bind(username)
      .first<{ id: string }>();

    if (!userToFollow) {
      return c.json({ error: "User not found" }, 404);
    }

    if (userToFollow.id === currentUser.id) {
      return c.json({ error: "Cannot follow yourself" }, 400);
    }

    // Check if already following
    const existing = await db
      .prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?")
      .bind(currentUser.id, userToFollow.id)
      .first();

    if (existing) {
      return c.json({ error: "Already following" }, 400);
    }

    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)")
      .bind(id, currentUser.id, userToFollow.id)
      .run();

    return c.json({ success: true });
  })
  // Unfollow a user (protected)
  .delete("/:username/follow", authMiddleware, async (c) => {
    const username = c.req.param("username");
    const currentUser = c.get("user");
    const db = c.env.DB;

    // Get user to unfollow
    const userToUnfollow = await db
      .prepare("SELECT id FROM users WHERE username = ?")
      .bind(username)
      .first<{ id: string }>();

    if (!userToUnfollow) {
      return c.json({ error: "User not found" }, 404);
    }

    await db
      .prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?")
      .bind(currentUser.id, userToUnfollow.id)
      .run();

    return c.json({ success: true });
  });
