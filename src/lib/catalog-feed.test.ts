import { describe, it, expect } from "vitest";
import { buildCatalogFeed } from "./catalog-feed";
import type { Product } from "./types";

const base: Product = {
  id: "1",
  sku: "1720-EAR-001",
  name: "Mermaid Tear",
  slug: "mermaid-tear",
  category_id: "earrings",
  price: 2200,
  compare_at_price: null,
  description: 'A teardrop, "flush-set", with crystals.',
  plating_spec: "",
  material_spec: "",
  images: ["/products/mermaid-tear-1.jpg", "/products/mermaid-tear-2.jpg"],
  stock_count: 20,
  is_new: true,
  ring_size_range: null,
  created_at: "",
};

const parse = (csv: string) => csv.trim().split("\n");

describe("buildCatalogFeed", () => {
  it("writes one row per colour, grouped as variants of one product", () => {
    const csv = buildCatalogFeed(
      [
        {
          ...base,
          colour_options: [
            { name: "Multicolour", image: "/products/mermaid-tear-1.jpg" },
            { name: "Clear crystal", image: "/products/mermaid-tear-2.jpg" },
          ],
        },
      ],
      "https://shop.example"
    );
    const [header, ...rows] = parse(csv);
    expect(header.split(",")).toContain("item_group_id");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain("1720-EAR-001-clear-crystal,1720-EAR-001,");
    expect(rows[1]).toContain(",https://shop.example/products/mermaid-tear-2.jpg,https://shop.example/products/mermaid-tear-1.jpg");
    expect(rows[0]).toContain("2200.00 PKR");
  });

  it("quotes fields containing commas or quotes", () => {
    const [, row] = parse(buildCatalogFeed([base], "https://shop.example"));
    expect(row).toContain('"A teardrop, ""flush-set"", with crystals."');
  });

  it("marks sold-out pieces out of stock", () => {
    const [, row] = parse(buildCatalogFeed([{ ...base, stock_count: 0 }], "https://shop.example"));
    expect(row).toContain(",out of stock,");
  });
});
