import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import transactionsRouter from "./transactions";
import categoriesRouter from "./categories";
import goalsRouter from "./goals";
import cardsRouter from "./cards";
import dashboardRouter from "./dashboard";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(transactionsRouter);
router.use(categoriesRouter);
router.use(goalsRouter);
router.use(cardsRouter);
router.use(dashboardRouter);
router.use(aiRouter);

export default router;
