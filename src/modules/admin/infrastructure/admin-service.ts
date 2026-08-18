import "server-only";

import { AdminService } from "@/modules/admin/application/admin.service";
import { prismaAdminRepository } from "./prisma-admin.repository";

export const adminService = new AdminService(prismaAdminRepository);
