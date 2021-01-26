import express from "express";
import { PORT } from "./constants";
import ocrRouter from "./routers/ocr-routes";

const app = express();
app.listen(PORT, () =>
  console.log("Ntap Gan, server lagi lari di port " + PORT)
);
// WEB ROUTE
const baseUrlWeb = "/api";
// ROUTES
app.use(baseUrlWeb, ocrRouter);
