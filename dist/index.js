"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const ocr_routes_1 = __importDefault(require("./routers/ocr-routes"));
const app = express_1.default();
app.listen(constants_1.PORT, () => console.log("Ntap Gan, server lagi lari di port " + constants_1.PORT));
const baseUrlWeb = "/api";
app.use(baseUrlWeb, ocr_routes_1.default);
//# sourceMappingURL=index.js.map