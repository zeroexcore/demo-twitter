import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { authMiddleware } from "../middleware/auth";

// Helper to parse images JSON from tweet records
function parseTweetImages(tweets: Record<string, unknown>[]) {
  return tweets.map((tweet) => ({
    ...tweet,
    images: tweet.images ? JSON.parse(tweet.images as string) : [],
  }));
}

export const timelineRoutes = new Hono<{ Bindings: Env; Variables: Variables }>()
  // Get public timeline (all recent tweets)
  .get("/public", async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const cursor = c.req.query("cursor");
    const db = c.env.DB;

    let query = `
      SELECT t.id, t.user_id, t.content, t.images, t.created_at, t.updated_at,
             u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
             (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count
      FROM tweets t
      JOIN users u ON t.user_id = u.id
    `;

    const params: (string | number)[] = [];

    if (cursor) {
      query += " WHERE t.created_at < ?";
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

    return c.json({ tweets: parseTweetImages(items), nextCursor });
  })
  // Get home timeline (tweets from followed users) - protected
  .get("/home", authMiddleware, async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const cursor = c.req.query("cursor");
    const user = c.get("user");
    const db = c.env.DB;

    let query = `
      SELECT t.id, t.user_id, t.content, t.images, t.created_at, t.updated_at,
             u.username, u.display_name, u.avatar_url,
             (SELECT COUNT(*) FROM likes WHERE tweet_id = t.id) as like_count,
             (SELECT COUNT(*) FROM retweets WHERE tweet_id = t.id) as retweet_count,
             EXISTS(SELECT 1 FROM likes WHERE tweet_id = t.id AND user_id = ?) as liked_by_me,
             EXISTS(SELECT 1 FROM retweets WHERE tweet_id = t.id AND user_id = ?) as retweeted_by_me
      FROM tweets t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
        UNION SELECT ?
      )
    `;

    const params: (string | number)[] = [user.id, user.id, user.id, user.id];

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

    return c.json({ tweets: parseTweetImages(items), nextCursor });
  });
