import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";

const createTweetSchema = z.object({
  content: z.string().min(1).max(280),
});

const updateTweetSchema = z.object({
  content: z.string().min(1).max(280),
});

export const tweetRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()
  // Get a single tweet
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const db = c.env.DB;

    const tweet = await db
      .prepare(
        `SELECT t.*, u.username, u.display_name, u.avatar_url,
                (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
                (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count
         FROM tweets t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ?`
      )
      .bind(id)
      .first();

    if (!tweet) {
      return c.json({ error: "Tweet not found" }, 404);
    }

    return c.json({ tweet });
  })
  // Create a tweet (protected)
  .post("/", authMiddleware, zValidator("json", createTweetSchema), async (c) => {
    const { content } = c.req.valid("json");
    const user = c.get("user");
    const db = c.env.DB;

    const id = crypto.randomUUID();

    await db
      .prepare("INSERT INTO tweets (id, user_id, content) VALUES (?, ?, ?)")
      .bind(id, user.id, content)
      .run();

    const tweet = await db
      .prepare(
        `SELECT t.*, u.username, u.display_name, u.avatar_url
         FROM tweets t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ?`
      )
      .bind(id)
      .first();

    return c.json({ tweet }, 201);
  })
  // Update a tweet (protected)
  .put("/:id", authMiddleware, zValidator("json", updateTweetSchema), async (c) => {
    const id = c.req.param("id");
    const { content } = c.req.valid("json");
    const user = c.get("user");
    const db = c.env.DB;

    // Check ownership
    const existing = await db
      .prepare("SELECT user_id FROM tweets WHERE id = ?")
      .bind(id)
      .first<{ user_id: string }>();

    if (!existing) {
      return c.json({ error: "Tweet not found" }, 404);
    }

    if (existing.user_id !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db
      .prepare(
        "UPDATE tweets SET content = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(content, id)
      .run();

    const tweet = await db
      .prepare(
        `SELECT t.*, u.username, u.display_name, u.avatar_url
         FROM tweets t
         JOIN users u ON t.user_id = u.id
         WHERE t.id = ?`
      )
      .bind(id)
      .first();

    return c.json({ tweet });
  })
  // Delete a tweet (protected)
  .delete("/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;

    // Check ownership
    const existing = await db
      .prepare("SELECT user_id FROM tweets WHERE id = ?")
      .bind(id)
      .first<{ user_id: string }>();

    if (!existing) {
      return c.json({ error: "Tweet not found" }, 404);
    }

    if (existing.user_id !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.prepare("DELETE FROM tweets WHERE id = ?").bind(id).run();

    return c.json({ success: true });
  })
  // Like a tweet (protected)
  .post("/:id/like", authMiddleware, async (c) => {
    const tweetId = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;

    // Check if tweet exists
    const tweet = await db
      .prepare("SELECT id FROM tweets WHERE id = ?")
      .bind(tweetId)
      .first();

    if (!tweet) {
      return c.json({ error: "Tweet not found" }, 404);
    }

    // Check if already liked
    const existingLike = await db
      .prepare("SELECT id FROM likes WHERE user_id = ? AND tweet_id = ?")
      .bind(user.id, tweetId)
      .first();

    if (existingLike) {
      return c.json({ error: "Already liked" }, 400);
    }

    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO likes (id, user_id, tweet_id) VALUES (?, ?, ?)")
      .bind(id, user.id, tweetId)
      .run();

    return c.json({ success: true });
  })
  // Unlike a tweet (protected)
  .delete("/:id/like", authMiddleware, async (c) => {
    const tweetId = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;

    await db
      .prepare("DELETE FROM likes WHERE user_id = ? AND tweet_id = ?")
      .bind(user.id, tweetId)
      .run();

    return c.json({ success: true });
  })
  // Retweet (protected)
  .post("/:id/retweet", authMiddleware, async (c) => {
    const tweetId = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;

    // Check if tweet exists
    const tweet = await db
      .prepare("SELECT id FROM tweets WHERE id = ?")
      .bind(tweetId)
      .first();

    if (!tweet) {
      return c.json({ error: "Tweet not found" }, 404);
    }

    // Check if already retweeted
    const existingRetweet = await db
      .prepare("SELECT id FROM retweets WHERE user_id = ? AND tweet_id = ?")
      .bind(user.id, tweetId)
      .first();

    if (existingRetweet) {
      return c.json({ error: "Already retweeted" }, 400);
    }

    const id = crypto.randomUUID();
    await db
      .prepare("INSERT INTO retweets (id, user_id, tweet_id) VALUES (?, ?, ?)")
      .bind(id, user.id, tweetId)
      .run();

    return c.json({ success: true });
  })
  // Undo retweet (protected)
  .delete("/:id/retweet", authMiddleware, async (c) => {
    const tweetId = c.req.param("id");
    const user = c.get("user");
    const db = c.env.DB;

    await db
      .prepare("DELETE FROM retweets WHERE user_id = ? AND tweet_id = ?")
      .bind(user.id, tweetId)
      .run();

    return c.json({ success: true });
  });
