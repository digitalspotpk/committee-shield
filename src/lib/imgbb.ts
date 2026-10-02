const ALLOWED_HOSTS = new Set(["i.ibb.co", "ibb.co", "avatars.githubusercontent.com"]);

/** Only https URLs from ImgBB (or GitHub avatars) are ever stored in the database. */
export function isTrustedImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ImgbbResponse = {
  success: boolean;
  status: number;
  data?: { url: string; display_url: string; delete_url?: string; width: string; height: string };
  error?: { message: string };
};

/** Server-side multipart upload to ImgBB. Returns the secure image URL. */
export async function uploadToImgbb(file: File, name: string): Promise<string> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) throw new Error("IMGBB_API_KEY is not configured");

  const form = new FormData();
  form.append("image", file, file.name || "upload");
  form.append("name", name.replace(/[^a-z0-9-_]/gi, "-").slice(0, 60));

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as ImgbbResponse | null;
  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.error?.message ?? `ImgBB upload failed (${res.status})`);
  }
  const url = json.data.url.replace(/^http:\/\//, "https://");
  if (!isTrustedImageUrl(url)) throw new Error("ImgBB returned an unexpected URL");
  return url;
}
