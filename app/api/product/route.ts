import { ProductExternalAPI } from "@/service/product/product.external";
import type { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  const client = new ProductExternalAPI();
  const [data, error] = await client.getAll().requestWithResult();

  if (error) {
    return Response.json(error, { status: error.status });
  }

  return Response.json({ data }, { status: 200 });
}
