import { extractError } from "@/lib/app/app-error";
import { ProductExternalAPI } from "@/service/product/product.external";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const client = new ProductExternalAPI();
    const data = await client.getAll();

    return Response.json({ data });
  } catch (e) {
    const error = extractError(e);

    return Response.json({ error }, { status: error.status });
  }
}
