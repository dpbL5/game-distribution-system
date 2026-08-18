import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { getEnvironment } from "@/infrastructure/config/env";
import type {
  MediaStorage,
  MediaUpload,
  StoredMedia,
} from "@/modules/game/application/media-storage";
import { AppError } from "@/shared/errors/app-error";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4"]);

export class LocalMediaStorage implements MediaStorage {
  async save(input: MediaUpload): Promise<StoredMedia> {
    const environment = getEnvironment();
    if (!allowedMimeTypes.has(input.mimeType)) {
      throw new AppError("MEDIA_TYPE_NOT_ALLOWED", "Loại tệp đa phương tiện không được hỗ trợ.");
    }
    if (input.buffer.byteLength > environment.MEDIA_MAX_BYTES) {
      throw new AppError("MEDIA_TOO_LARGE", "Tệp đa phương tiện vượt quá giới hạn kích thước.");
    }

    const extension = extname(basename(input.filename)).toLowerCase();
    const relativePath = join(new Date().toISOString().slice(0, 10), `${randomUUID()}${extension}`);
    const absolutePath = this.resolvePath(relativePath);
    await mkdir(resolve(environment.MEDIA_ROOT, relativePath, ".."), { recursive: true });
    await writeFile(absolutePath, input.buffer, { flag: "wx" });

    return { path: relativePath.replaceAll("\\", "/"), mimeType: input.mimeType, bytes: input.buffer.byteLength };
  }

  read(relativePath: string): Promise<Buffer> {
    return readFile(this.resolvePath(relativePath));
  }

  async delete(relativePath: string): Promise<void> {
    try {
      await unlink(this.resolvePath(relativePath));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  private resolvePath(relativePath: string): string {
    const root = resolve(getEnvironment().MEDIA_ROOT);
    const absolute = resolve(root, relativePath);
    const pathFromRoot = relative(root, absolute);
    if (pathFromRoot.startsWith("..") || pathFromRoot.includes("..")) {
      throw new AppError("FORBIDDEN", "Đường dẫn tệp đa phương tiện không hợp lệ.");
    }
    return absolute;
  }
}

export const localMediaStorage = new LocalMediaStorage();
