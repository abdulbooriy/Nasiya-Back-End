import { Markup, Scenes } from "telegraf";

import { MyContext } from "../../utils/context";
import logger from "../../../utils/logger";

const startScene = new Scenes.BaseScene<MyContext>("start");

startScene.enter(async (ctx) => {
  console.log("📍 Start scene entered!");
  try {
    if (!ctx.from) {
      return;
    }

    const telegramId = ctx.from.id;

    return await ctx.scene.enter("phone");
  } catch (e: any) {
    logger.debug("Stack:", e.stack);

    try {
      await ctx.reply(
        " Xatolik yuz berdi.\n\n" +
          "Iltimos, /start ni qayta bosing yoki administrator bilan bog'laning.",
      );
    } catch (replyErr) {
      logger.debug(" Reply error:", replyErr);
    }
  }
});

export default startScene;
