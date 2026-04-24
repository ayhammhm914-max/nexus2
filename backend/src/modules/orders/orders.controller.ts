import type { Request, Response } from "express";
import { successResponse } from "../../utils/response.utils";
import { ordersService } from "./orders.service";

export const ordersController = {
  checkout: async (req: Request, res: Response) => {
    const result = await ordersService.checkout({
      userId: req.user?.sub,
      guestEmail: req.body.guestEmail,
      paymentMethod: req.body.paymentMethod,
      couponCode: req.body.couponCode,
      items: req.body.items,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    return res.status(201).json(successResponse(result, "Checkout initialized."));
  },

  list: async (req: Request, res: Response) => {
    const result = await ordersService.listUserOrders(req.user!.sub);
    return res.json(successResponse(result));
  },

  detail: async (req: Request, res: Response) => {
    const result = await ordersService.getOrderDetail(req.user!.sub, String(req.params.orderNumber));
    return res.json(successResponse(result));
  },

  cancel: async (req: Request, res: Response) => {
    const result = await ordersService.cancelOrder(req.user!.sub, String(req.params.id));
    return res.json(successResponse(result, "Order cancelled."));
  },

  refundRequest: async (req: Request, res: Response) => {
    const result = await ordersService.requestRefund(
      req.user!.sub,
      String(req.params.id),
      req.body.reason
    );
    return res.status(201).json(successResponse(result, "Refund request submitted."));
  },

  dispute: async (req: Request, res: Response) => {
    const result = await ordersService.createDispute(
      req.user!.sub,
      String(req.params.id),
      req.body.reason
    );
    return res.status(201).json(successResponse(result, "Dispute opened."));
  }
};
