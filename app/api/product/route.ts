import { extractError } from "@/lib/app/app-error";
import { HttpFetch } from "@/lib/http";
import { HttpService } from "@/lib/http/interface";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const client = HttpFetch({
      service: HttpService.TEST
    });

    const data = await client.get("/p1osts/1231").request();

    return Response.json({ data });
  } catch (e) {
    const error = extractError(e);

    return Response.json({ error }, { status: error.status });
  }
}
