import { Router } from "express";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { searchController } from "./search.controller";

export const searchRoutes = Router();

searchRoutes.get("/", rateLimiters.search, asyncHandler(searchController.search));
searchRoutes.get("/suggestions", rateLimiters.search, asyncHandler(searchController.suggestions));
