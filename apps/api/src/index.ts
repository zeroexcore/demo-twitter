import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";
import { tweetRoutes } from "./routes/tweets";
import { userRoutes } from "./routes/users";
import { timelineRoutes } from "./routes/timeline";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:35173",
      "https://twitter-demo.oxc.dev",
    ],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "demo-twitter-api" }));

// Routes
app.route("/auth", authRoutes);
app.route("/tweets", tweetRoutes);
app.route("/users", userRoutes);
app.route("/timeline", timelineRoutes);

export default app;

// Export typed client
export type AppType = typeof app;
