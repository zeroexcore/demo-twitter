import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../types";
import {
  createToken,
  hashPassword,
  verifyPassword,
} from "../middleware/auth";

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRoutes = new Hono<{ Bindings: Env }>()
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { username, email, password, displayName } = c.req.valid("json");
    const db = c.env.DB;

    // Check if user exists
    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ? OR username = ?")
      .bind(email, username)
      .first();

    if (existing) {
      return c.json({ error: "User already exists" }, 400);
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    await db
      .prepare(
        `INSERT INTO users (id, username, email, password_hash, display_name)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, username, email, passwordHash, displayName)
      .run();

    const token = createToken({ id, username, email });

    return c.json({
      user: { id, username, email, displayName },
      token,
    });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const db = c.env.DB;

    const user = await db
      .prepare(
        "SELECT id, username, email, password_hash, display_name FROM users WHERE email = ?"
      )
      .bind(email)
      .first<{
        id: string;
        username: string;
        email: string;
        password_hash: string;
        display_name: string;
      }>();

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = createToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
      },
      token,
    });
  });
