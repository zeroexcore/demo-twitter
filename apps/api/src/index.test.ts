import { describe, it, expect } from "vitest";
import app from "./index";

describe("API", () => {
  it("health check returns ok status", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ status: "ok", service: "demo-twitter-api" });
  });
});
