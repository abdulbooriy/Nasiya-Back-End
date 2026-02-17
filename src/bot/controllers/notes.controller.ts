import { Request, Response, NextFunction } from "express";

import notesService from "../services/notes.service";
import { plainToInstance } from "class-transformer";

import { handleValidationErrors } from "../../validators/format";
import { NotesDto } from "../../validators/notes";
import { validate } from "class-validator";

import BaseError from "../../utils/base.error";
import logger from "../../utils/logger";

class NotesController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const id = req.params.id;
      if (!user) {
        return next(BaseError.ForbiddenError());
      }

      const data = await notesService.getById(user, id);
      res.json(data);
    } catch (error) {
      logger.debug("error", error);

      return next(error);
    }
  }

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      const notesData = plainToInstance(NotesDto, req.body || {});
      const errors = await validate(notesData);
      if (errors.length > 0) {
        const formattedErrors = handleValidationErrors(errors);
        return next(
          BaseError.BadRequest("Izoh ma'lumotlari xato.", formattedErrors),
        );
      }
      if (!user) {
        return next(BaseError.ForbiddenError());
      }

      const data = await notesService.add(user, notesData);
      res.json(data);
    } catch (error) {
      logger.debug("error", error);

      return next(error);
    }
  }
}
export default new NotesController();
