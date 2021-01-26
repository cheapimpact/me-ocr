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
exports.ocrWithGCP = void 0;
const storage_1 = require("@google-cloud/storage");
const multer_1 = __importDefault(require("../helpers/multer"));
const fs_1 = __importDefault(require("fs"));
const { DocumentProcessorServiceClient, } = require("@google-cloud/documentai").v1beta3;
const projectId = "perceptive-map-291704";
const location = "eu";
const processorId = "586668a2c03e20cc";
const upload = multer_1.default();
const client = new DocumentProcessorServiceClient({
    keyFilename: "APIKEY.json",
});
const storage = new storage_1.Storage({
    keyFilename: "APIKEY.json",
});
let fullText = "";
const ocrWithGCP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    upload.single("meocr")(req, res, (err) => {
        const { file } = req;
        if (!file) {
            const error = new Error("Please upload a file");
            return next(error);
        }
        const fileName = file.filename;
        const filePath = file.path;
        doScan(filePath);
    });
});
exports.ocrWithGCP = ocrWithGCP;
const uploadToBucket = (res, filePath, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    yield storage.bucket(bucketName).upload(filePath, {});
    const filePathGS = `${bucketName}/${fileName}`;
    console.log({ filePathGS });
});
const doScan = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = `//eu-documentai.googleapis.com/v1beta3/projects/148978327527/locations/eu/processors/586668a2c03e20cc`;
        const imageFile = yield fs_1.default.promises.readFile(filePath);
        const encodedImage = Buffer.from(imageFile).toString("base64");
        const request = {
            name,
            document: {
                content: encodedImage,
                mimeType: "application/pdf",
            },
        };
        console.log({});
        const [result] = yield client.processDocument({
            name: "https://eu-documentai.googleapis.com/v1beta3/projects/148978327527/locations/eu/processors/586668a2c03e20cc:process",
            document: {
                content: encodedImage,
                mimeType: "application/pdf",
            },
        });
        console.log("jalan");
        const { document } = result;
        const { text } = document;
        const getText = (textAnchor) => {
            if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
                return "";
            }
            const startIndex = textAnchor.textSegments[0].startIndex || 0;
            const endIndex = textAnchor.textSegments[0].endIndex;
            return text.substring(startIndex, endIndex);
        };
        console.log("The document contains the following paragraphs:");
        const [page1] = document.pages;
        const { paragraphs } = page1;
        for (const paragraph of paragraphs) {
            const paragraphText = getText(paragraph.layout.textAnchor);
            console.log(`Paragraph text:\n${paragraphText}`);
        }
    }
    catch (err) {
        console.log({ err });
    }
});
//# sourceMappingURL=ocr-google.js.map