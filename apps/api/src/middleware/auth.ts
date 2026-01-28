import { createMiddleware } from "hono/factory";
import type { Env, AuthUser, Variables } from "../types";

// Simple JWT-like token validation (for demo purposes)
// In production, use proper JWT library
export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    // Decode the base64 token (simple demo implementation)
    const decoded = JSON.parse(atob(token)) as AuthUser & { exp: number };

    if (decoded.exp < Date.now()) {
      return c.json({ error: "Token expired" }, 401);
    }

    c.set("user", {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    });

    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});

// Helper to create a simple token (for demo purposes)
export function createToken(user: AuthUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload));
}

// Helper to hash password (simple demo - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}
