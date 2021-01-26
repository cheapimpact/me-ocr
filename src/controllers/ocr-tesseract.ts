import Tesseract from "tesseract.js";
import createMulter from "../helpers/multer";
import fs from "fs";
import { NextFunction, Request, Response } from "express";

const worker = Tesseract.createWorker({
  logger: (m) => console.log(m),
});
const upload = createMulter().single("meocr");
export const ocrWithTesseract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, (_: any) => {
    fs.readFile(`./public/uploads/${req.file.filename}`, async (err, data) => {
      if (err) return console.log({ err });
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { text },
      } = await worker.recognize(data);
      res.send(text);
      await worker.terminate();
    });
  });
};
