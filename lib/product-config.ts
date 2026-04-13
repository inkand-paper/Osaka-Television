
// lib/product-config.ts
export const PRODUCT_MAPPING = {
  "24 inch": { label: "24 inch (TV)", size: "24\"", models: ["Basic Frameless", "Basic Double Glass", "Smart Frameless", "Smart Double Glass", "Regular Series", "Gold Series", "Google TV"], hasTypes: true },
  // ... rest
} as const

export type CategoryKey = keyof typeof PRODUCT_MAPPING