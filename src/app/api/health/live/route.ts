export function GET() {
  return Response.json({ status: "ok", service: "playport", check: "live" });
}
