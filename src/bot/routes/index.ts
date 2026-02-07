import { Router } from "express";
import { botManager } from "../../middlewares/botManager.middleware";

import authRoute from "./auth.routes";
import customerRoute from "./customer.routes";
import paymentRoute from "./payment.routes";
import dashboardRoute from "./dashboard.routes";
import notesRoute from "./notes.routes";
import expensesRoute from "./expenses.routes";
import contractRoute from "./contract.routes";
import notificationRoute from "./notification.routes";
import prepaidRoute from "./prepaid.routes";
import debtorRoute from "./debtor.routes";

const routes = Router();

routes.use("/auth", authRoute);
// routes.use("/user", userRoute);
routes.use("/customer", botManager, customerRoute);
routes.use("/payment", botManager, paymentRoute);
routes.use("/contract", botManager, contractRoute);
routes.use("/dashboard", botManager, dashboardRoute);
routes.use("/notes", botManager, notesRoute);
routes.use("/expenses", botManager, expensesRoute);
routes.use("/notifications", botManager, notificationRoute);
routes.use("/prepaid", botManager, prepaidRoute);
routes.use("/debts", botManager, debtorRoute);

export default routes;
