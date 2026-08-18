import "server-only";

import { UserService } from "@/modules/user/application/user.service";
import { prismaUserRepository } from "./prisma-user.repository";

export const userService = new UserService(prismaUserRepository);
