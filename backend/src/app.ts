import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { uomRouter } from "./modules/uom/uom.routes";
import { warehousesRouter } from "./modules/warehouses/warehouses.routes";
import { locationsRouter } from "./modules/locations/locations.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/uom", uomRouter);
app.use("/api/warehouses", warehousesRouter);
app.use("/api/locations", locationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
