"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ocr_google_1 = require("../controllers/ocr-google");
const ocr_tesseract_1 = require("../controllers/ocr-tesseract");
const router = express_1.default.Router();
router.post("/ocr/tesseract", ocr_tesseract_1.ocrWithTesseract);
router.post("/ocr/gcp", ocr_google_1.ocrWithGCP);
exports.default = router;
//# sourceMappingURL=ocr-routes.js.map