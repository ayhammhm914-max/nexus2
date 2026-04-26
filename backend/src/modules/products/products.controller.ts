import type { Request, Response } from "express";
import { logAdminAction } from "../../middleware/admin-audit.middleware";
import { successResponse } from "../../utils/response.utils";
import { productsService } from "./products.service";

export const productsController = {
  list: async (req: Request, res: Response) => {
    const result = await productsService.list(req.query as Record<string, unknown>);
    return res.json(successResponse(result));
  },

  featured: async (_req: Request, res: Response) => {
    const result = await productsService.featured();
    return res.json(successResponse(result));
  },

  hotDeals: async (_req: Request, res: Response) => {
    const result = await productsService.hotDeals();
    return res.json(successResponse(result));
  },

  newArrivals: async (_req: Request, res: Response) => {
    const result = await productsService.newArrivals();
    return res.json(successResponse(result));
  },

  bySlug: async (req: Request, res: Response) => {
    const result = await productsService.bySlug(String(req.params.slug));
    return res.json(successResponse(result));
  },

  related: async (req: Request, res: Response) => {
    const result = await productsService.related(String(req.params.id));
    return res.json(successResponse(result));
  },

  create: async (req: Request, res: Response) => {
    const result = await productsService.create(req.body, req.user?.sub, req.user?.role, {
      ip: req.ip,
      userAgent: req.get("user-agent")
    });
    await logAdminAction(req.user?.sub, "product.create", "Product", result.id, result as never, req.ip);
    return res.status(201).json(successResponse(result, "Product created."));
  },

  update: async (req: Request, res: Response) => {
    const result = await productsService.update(
      String(req.params.id),
      req.body,
      req.user?.sub,
      req.user?.role,
      {
        ip: req.ip,
        userAgent: req.get("user-agent")
      }
    );
    await logAdminAction(req.user?.sub, "product.update", "Product", result.id, req.body, req.ip);
    return res.json(successResponse(result, "Product updated."));
  },

  remove: async (req: Request, res: Response) => {
    const result = await productsService.remove(String(req.params.id), req.user?.sub, req.user?.role, {
      ip: req.ip,
      userAgent: req.get("user-agent")
    });
    await logAdminAction(req.user?.sub, "product.delete", "Product", result.id, { isActive: false }, req.ip);
    return res.json(successResponse(result, "Product archived."));
  },

  importKeys: async (req: Request, res: Response) => {
    const result = await productsService.importKeys(
      String(req.params.id),
      req.body.keys,
      req.body.batchLabel,
      req.user?.sub,
      req.user?.role,
      {
        ip: req.ip,
        userAgent: req.get("user-agent")
      }
    );
    await logAdminAction(
      req.user?.sub,
      "product.keys.import",
      "Product",
      String(req.params.id),
      { importedCount: result.importedCount, batchId: result.batchId },
      req.ip
    );
    return res.status(201).json(successResponse(result, "Keys imported."));
  }
};
