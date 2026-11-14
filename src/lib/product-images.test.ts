import { describe, it, expect } from "vitest";
import { landingImage } from "./product-images";
import type { Product } from "./types";

const product = (images: string[]) => ({ images }) as Product;

describe("landingImage", () => {
  it("prefers the first styled photo over the cut-out", () => {
    expect(landingImage(product(["/a-1.jpg", "/a-2.jpg", "/a-3.jpg"]))).toBe("/a-2.jpg");
  });

  it("skips designed collages", () => {
    expect(landingImage(product(["/products/deco-link-1.jpg", "/products/deco-link-5.jpg", "/products/deco-link-4.jpg"]))).toBe(
      "/products/deco-link-4.jpg",
    );
  });

  it("falls back to the first photo when it is the only one", () => {
    expect(landingImage(product(["/only.jpg"]))).toBe("/only.jpg");
  });
});
