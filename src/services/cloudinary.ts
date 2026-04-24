const CLOUD = "diwozc824";
const PRESET = "qbxh6ddv";
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string; // "image" | "raw"
  format: string;
  bytes: number;
}

export async function uploadFile(file: File) {
  if (!CLOUD || !PRESET) {
    throw new Error("Cloudinary is not configured. Add env variables.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", PRESET);
  form.append("folder", "bloom-community");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/upload`, // ✅ FIXED
    {
      method: "POST",
      body: form,
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Upload failed (${res.status})`);
  }

  return res.json();
}
export function validateFile(file: File): string | null {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const ALLOWED = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf", // ✅ ADD THIS
  ];

  if (!ALLOWED.includes(file.type)) {
    return "Only images and PDF files are supported.";
  }

  if (file.size > MAX_SIZE) {
    return "File must be under 10 MB.";
  }

  return null;
}
