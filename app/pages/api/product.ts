import { getProductService } from "@/app/server/service/product.service";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      const result = getProductService();
      res.status(200).json({ data: "Get Product" });
      break;
  }
}
