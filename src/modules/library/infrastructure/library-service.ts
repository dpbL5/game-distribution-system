import "server-only";

import { LibraryService } from "@/modules/library/application/library.service";
import { prismaLibraryRepository } from "./prisma-library.repository";

export const libraryService = new LibraryService(prismaLibraryRepository);
