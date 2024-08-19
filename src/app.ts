/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middleware/globalErrorhandler";
import notFound from "./app/middleware/notfound";
import router from "./app/routes";

const app: Application = express();
app.use(express.static("public"));

//parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
// application routes
app.use("/api/v1", router);
app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});
app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
