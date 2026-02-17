import { Scenes } from "telegraf";

import { MyContext } from "../utils/context";

import startScene from "./start/start";
import phoneScene from "./auth/phone";

const stage = new Scenes.Stage<MyContext>([startScene, phoneScene]);
export default stage;
