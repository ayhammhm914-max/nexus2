import type { Request, Response } from "express";
import { successResponse } from "../../utils/response.utils";
import { cartService } from "./cart.service";

export const cartController = {
  get: async (req: Request, res: Response) => {
    const cart = await cartService.get(req.user!.sub);
    return res.json(successResponse(cart));
  },

  addItem: async (req: Request, res: Response) => {
    const cart = await cartService.addItem(req.user!.sub, req.body.productId, req.body.quantity);
    return res.status(201).json(successResponse(cart, "Item added to cart."));
  },

  updateItem: async (req: Request, res: Response) => {
    const cart = await cartService.updateItem(
      req.user!.sub,
      String(req.params.productId),
      req.body.quantity
    );
    return res.json(successResponse(cart, "Cart item updated."));
  },

  removeItem: async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(req.user!.sub, String(req.params.productId));
    return res.json(successResponse(cart, "Item removed from cart."));
  },

  clear: async (req: Request, res: Response) => {
    const cart = await cartService.clear(req.user!.sub);
    return res.json(successResponse(cart, "Cart cleared."));
  },

  validate: async (req: Request, res: Response) => {
    const validation = await cartService.validate(req.user!.sub);
    return res.json(successResponse(validation));
  }
};
