import { Telegraf } from "telegraf";

import { MyContext } from "../utils/context";
import config from "../utils/config";

if (!config.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not defined in config");
}

const bot = new Telegraf<MyContext>(config.BOT_TOKEN, {
  handlerTimeout: 90000,
});

export default bot;
