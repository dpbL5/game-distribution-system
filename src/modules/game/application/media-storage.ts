export type MediaUpload = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

export type StoredMedia = {
  path: string;
  mimeType: string;
  bytes: number;
};

export interface MediaStorage {
  save(input: MediaUpload): Promise<StoredMedia>;
  read(relativePath: string): Promise<Buffer>;
  delete(relativePath: string): Promise<void>;
}
