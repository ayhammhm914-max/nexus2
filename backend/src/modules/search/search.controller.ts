import type { Request, Response } from "express";
import { successResponse } from "../../utils/response.utils";
import { searchService } from "./search.service";

export const searchController = {
  search: async (req: Request, res: Response) => {
    const q = String(req.query.q ?? "").trim();
    const result = await searchService.search(q);
    return res.json(successResponse(result));
  },

  suggestions: async (req: Request, res: Response) => {
    const q = String(req.query.q ?? "").trim();
    const result = await searchService.suggestions(q);
    return res.json(successResponse(result));
  }
};

