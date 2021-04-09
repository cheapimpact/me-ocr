import express from "express";
// import { ocrWithGCP } from "../controllers/ocr-google";
import { ocrWithGCP } from "../controllers/ocr-google-v2";
import { ocrWithTesseract } from "../controllers/ocr-tesseract";

// eslint-disable-next-line new-cap
const router = express.Router();

// ============================================================== //
// ===================== ROUTE EXPLANATION ====================== //
// ============================================================== //

router.post("/ocr/tesseract", ocrWithTesseract);
router.post("/ocr/gcp", ocrWithGCP);

export default router;
