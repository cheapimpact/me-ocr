"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrWithTesseract = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const multer_1 = __importDefault(require("../helpers/multer"));
const fs_1 = __importDefault(require("fs"));
const worker = tesseract_js_1.default.createWorker({
    logger: (m) => console.log(m),
});
const upload = multer_1.default().single("meocr");
const ocrWithTesseract = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (_) => {
        fs_1.default.readFile(`./public/uploads/${req.file.filename}`, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return console.log({ err });
            yield worker.load();
            yield worker.loadLanguage("eng");
            yield worker.initialize("eng");
            const { data: { text }, } = yield worker.recognize(data);
            res.send(text);
            yield worker.terminate();
        }));
    });
});
exports.ocrWithTesseract = ocrWithTesseract;
//# sourceMappingURL=ocr-tesseract.js.map