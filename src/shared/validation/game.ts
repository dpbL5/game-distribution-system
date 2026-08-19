import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const platformEnum = z.enum(["WINDOWS", "MACOS", "LINUX", "PC", "PLAYSTATION", "XBOX"]);

export const platformInputSchema = z
  .string()
  .trim()
  .min(1, "Nền tảng là bắt buộc.")
  .transform((value) => value.split(",").map((part) => part.trim().toUpperCase()).filter(Boolean))
  .pipe(z.array(platformEnum).min(1, "Chọn ít nhất một nền tảng."));

export const gameBaseSchema = z.object({
  name: z.string().trim().min(2, "Tên phải có ít nhất 2 ký tự.").max(180),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(200)
    .regex(slugPattern, "Slug chỉ gồm chữ thường, số và dấu gạch ngang."),
  shortDescription: z.string().trim().min(1).max(320),
  description: z.string().trim().min(1),
  basePrice: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Giá phải là số thập phân hợp lệ.")
    .refine((value) => Number(value) >= 0, "Giá không được âm."),
  releaseDate: z.coerce.date(),
  platforms: platformInputSchema,
  developerId: z.string().uuid("Nhà phát triển không hợp lệ."),
  publisherId: z.string().uuid("Nhà phát hành không hợp lệ."),
  heroPath: z.string().trim().max(500).nullable().optional(),
  ageRating: z.string().trim().max(20).nullable().optional(),
  minimumRequirements: z.unknown().nullable().optional(),
  recommendedRequirements: z.unknown().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});

export const createGameSchema = gameBaseSchema;

export const updateGameSchema = gameBaseSchema.partial().extend({
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]).optional(),
  coverPath: z.string().trim().max(500).nullable().optional(),
});
