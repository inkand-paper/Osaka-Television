import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the raw filename from a Supabase public storage URL.
 * Example: https://.../product-images/my-image.png -> my-image.png
 */
export function extractStorageFilename(url: string) {
  if (!url) return null
  try {
    const parts = url.split('/')
    return parts[parts.length - 1]
  } catch (e) {
    return null
  }
}
