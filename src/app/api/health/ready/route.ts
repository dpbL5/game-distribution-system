import { prisma } from "@/infrastructure/database/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", service: "playport", check: "ready" });
  } catch {
    return Response.json({ status: "error", service: "playport", check: "ready" }, { status: 503 });
  }
}
