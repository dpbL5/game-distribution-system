import "server-only";

import { ReviewService } from "@/modules/review/application/review.service";
import { prismaReviewRepository } from "./prisma-review.repository";

export const reviewService = new ReviewService(prismaReviewRepository);
