import type { Request, Response } from "express";
import { successResponse } from "../../utils/response.utils";
import { authService } from "../auth/auth.service";

export const adminController = {
  listSessions: async (req: Request, res: Response) => {
    const sessions = await authService.listAdminSessions(req.user!.sub, req.user?.sessionId);
    return res.json(successResponse(sessions));
  },

  revokeSession: async (req: Request, res: Response) => {
    const result = await authService.revokeAdminSession(req.user!.sub, String(req.params.id));
    return res.json(successResponse(result, "Session revoked."));
  },

  revokeAllSessions: async (req: Request, res: Response) => {
    const result = await authService.revokeAllOtherSessions(req.user!.sub, req.user?.sessionId);
    return res.json(successResponse(result, "Other sessions revoked."));
  }
};
