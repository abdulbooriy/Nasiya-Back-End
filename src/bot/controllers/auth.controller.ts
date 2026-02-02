import { Request, Response, NextFunction } from "express";
import authService from "../services/user.service";
import { plainToInstance } from "class-transformer";
import { LoginDto } from "../../validators/auth";
import { handleValidationErrors } from "../../validators/format";
import { validate } from "class-validator";
import BaseError from "../../utils/base.error";
import { profile } from "console";
import { checkTelegramInitData } from "../utils/checkInitData";
import config from "../utils/config";
import logger from "../../utils/logger";
import Employee from "../../schemas/employee.schema";
import IEmployeeData from "../../types/employeeData";
import IJwtUser from "../../types/user";
import jwt from "../../utils/jwt";

class AuthController {
  async checkRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug("🔍 Check registration request received");
      
      const { initData } = req.body;

      if (!initData) {
        logger.error("❌ checkRegistration: initData topilmadi");
        return next(BaseError.BadRequest("initData topilmadi"));
      }

      logger.debug("✅ checkRegistration: initData mavjud");

      const telegramId = checkTelegramInitData(initData);

      if (!telegramId) {
        logger.error("❌ checkRegistration: telegramId ajratib olinmadi");
        return next(BaseError.UnauthorizedError("initData noto'g'ri"));
      }

      logger.debug("✅ checkRegistration: Telegram ID:", telegramId);

      const employee = await Employee.findOne({
        telegramId: telegramId.toString(),
        isActive: true,
        isDeleted: false,
      }).populate("role");

      const isRegistered = !!employee;

      logger.debug("✅ checkRegistration natija:", {
        isRegistered,
        telegramId: telegramId.toString(),
        employeeFound: !!employee
      });

      res.json({
        isRegistered,
        telegramId: telegramId.toString(),
        ...(employee && {
          profile: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role?.name,
          },
        }),
      });
    } catch (err) {
      logger.error("❌ checkRegistration xatolik:", err);
      return next(err);
    }
  }

  async telegram(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug("🔐 Telegram auth request received");
      logger.debug("📦 Request body:", JSON.stringify(req.body).substring(0, 200));

      const { initData } = req.body;

      if (!initData) {
        logger.error("❌ initData topilmadi");
        return next(BaseError.ForbiddenError("initData topilmadi"));
      }

      logger.debug("✅ initData mavjud, uzunligi:", initData.length);

      const telegramId = checkTelegramInitData(initData);

      if (!telegramId) {
        logger.error("❌ telegramId ajratib olinmadi");
        return next(BaseError.UnauthorizedError("initData noto'g'ri"));
      }

      logger.debug("✅ Telegram ID:", telegramId);

      const employee = await Employee.findOne({
        telegramId: telegramId.toString(),
        isActive: true,
        isDeleted: false,
      }).populate("role");

      logger.debug("🔍 Employee qidiruv natijasi:", employee ? "Topildi" : "Topilmadi");

      if (!employee) {
        logger.error("❌ Employee topilmadi, telegramId:", telegramId);
        return next(BaseError.NotFoundError("Foydalanuvchi topilmadi"));
      }

      logger.debug("✅ Employee topildi:", {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        role: employee.role?.name
      });

      const employeeData: IEmployeeData = {
        id: employee.id,
        firstname: employee.firstName,
        lastname: employee.lastName,
        phoneNumber: employee.phoneNumber,
        telegramId: employee.telegramId,
        role: employee.role.name,
      };

      const employeeDto: IJwtUser = {
        sub: employee.id.toString(),
        name: employee.firstName,
        role: employee.role.name,
      };

      const accessToken = jwt.signBot(employeeDto);

      logger.debug("✅ Token yaratildi, javob yuborilmoqda");

      res.json({ profile: employeeData, token: accessToken });
    } catch (err) {
      logger.error("❌ Telegram auth xatolik:", err);
      return next(err);
    }
  }
}
export default new AuthController();
