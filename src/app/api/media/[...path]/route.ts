import { extname } from "node:path";

import { NextResponse } from "next/server";

import { localMediaStorage } from "@/infrastructure/storage/local-media-storage";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const relativePath = path.join("/");
    const file = await localMediaStorage.read(relativePath);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type":
          contentTypes[extname(relativePath).toLowerCase()] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "MEDIA_NOT_FOUND" }, { status: 404 });
  }
}
