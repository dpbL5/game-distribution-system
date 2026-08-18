import { NextResponse } from "next/server";

import { requireAdmin } from "@/modules/auth/application/guards";
import { prisma } from "@/infrastructure/database/prisma";
import { localMediaStorage } from "@/infrastructure/storage/local-media-storage";
import { isAppError } from "@/shared/errors/app-error";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const gameId = String(formData.get("gameId") ?? "");
    const type = String(formData.get("type") ?? "IMAGE");
    const title = String(formData.get("title") ?? "") || null;
    const file = formData.get("file");
    if (!gameId || !(file instanceof File)) {
      return NextResponse.json({ error: "MEDIA_FILE_REQUIRED" }, { status: 400 });
    }
    if (type !== "IMAGE" && type !== "VIDEO") {
      return NextResponse.json({ error: "MEDIA_TYPE_NOT_ALLOWED" }, { status: 400 });
    }

    const stored = await localMediaStorage.save({
      buffer: Buffer.from(await file.arrayBuffer()),
      filename: file.name,
      mimeType: file.type,
    });
    try {
      const media = await prisma.gameMedia.create({
        data: { gameId, type, path: stored.path, title },
      });
      return NextResponse.json(
        { id: media.id, path: media.path, type: media.type },
        { status: 201 },
      );
    } catch (error) {
      await localMediaStorage.delete(stored.path);
      throw error;
    }
  } catch (error) {
    if (isAppError(error))
      return NextResponse.json({ error: error.code }, { status: error.status });
    return NextResponse.json({ error: "MEDIA_UPLOAD_FAILED" }, { status: 400 });
  }
}
