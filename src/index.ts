import "dotenv-safe/config";
import express from "express";
import { PORT } from "./constants";
import ocrRouter from "./routers/ocr-routes";
import cors from "cors";
const app = express();
app.listen(PORT, () =>
  console.log("Ntap Gan, server lagi lari di port " + PORT)
);

// CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
// WEB ROUTE
const baseUrlWeb = "/api";
// ROUTES
app.use(baseUrlWeb, ocrRouter);
