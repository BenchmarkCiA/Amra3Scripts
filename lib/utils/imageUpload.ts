const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** Returns a safe extension for an uploaded image, or an error message. SVG/HTML are rejected. */
export function checkImageUpload(file: unknown): { ext: string; type: string } | { error: string } {
  if (!(file instanceof File)) return { error: "No file provided" }
  const ext = ALLOWED[file.type]
  if (!ext) return { error: "Only JPG, PNG, WebP, GIF or AVIF images are allowed" }
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Image must be 5 MB or smaller" }
  return { ext, type: file.type }
}
