import { Request, Response, NextFunction } from "express";

import dashboardService from "../services/dashboard.service";

class DashboardController {
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const data = await dashboardService.dashboard(user);
      res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  }

  async currencyCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const data = await dashboardService.currencyCourse();
      res.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  }
}
export default new DashboardController();
