import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60).allowed).toBe(true);
    }
  });

  it("blocks requests beyond the limit within the window", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 60);
    rateLimit(key, 2, 60);
    const result = rateLimit(key, 2, 60);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks independent keys separately", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    rateLimit(keyA, 1, 60);
    expect(rateLimit(keyA, 1, 60).allowed).toBe(false);
    expect(rateLimit(keyB, 1, 60).allowed).toBe(true);
  });
});
