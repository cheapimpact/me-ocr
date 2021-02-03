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
const status_1 = require("../helpers/status");
const multer_1 = __importDefault(require("../helpers/multer"));
const { DocumentUnderstandingServiceClient, } = require("@google-cloud/documentai");
const projectId = "tesml-294814";
const location = "us";
const bucketName = "ocr_bucket_nsw";
const upload = multer_1.default();
const client = new DocumentUnderstandingServiceClient({
    keyFilename: "APIKEY.json",
});
const storage = new storage_1.Storage({
    keyFilename: "APIKEY.json",
});
let fullText = "";
const ocrWithGCP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    upload.single("file")(req, res, (_) => {
        const { file } = req;
        if (!file) {
            const error = new Error("Please upload a file");
            return next(error);
        }
        const fileName = file.filename;
        const filePath = file.path;
        uploadToBucket(res, filePath, fileName);
    });
});
exports.ocrWithGCP = ocrWithGCP;
const uploadToBucket = (res, filePath, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    doOCR(res, "ocr_bucket_nsw/1612336894_1._nilai_pabean_berdasarkan_nilai_transaksi_barang_impor_bersangkutan.pdf");
});
const doOCR = (res, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parent = `projects/${projectId}/locations/${location}`;
        const gcsInputUri = `gs://${filePath}`;
        const request = {
            parent,
            inputConfig: {
                gcsSource: {
                    uri: gcsInputUri,
                },
                mimeType: "application/pdf",
            },
            tableExtractionParams: {
                enabled: true,
            },
        };
        const [result] = yield client.processDocument(request);
        console.log("jalan");
        const { text, pages } = result;
        fullText = text;
        const responseJson = {};
        const responseTable = parsingTable(pages);
        responseJson["file_url"] = "https://storage.cloud.google.com/" + filePath;
        responseJson["data_table"] = responseTable;
        const responseForm = parsingForm(pages);
        responseJson["data_form"] = responseForm;
        const responseText = fullText.split("\n");
        responseJson["data_text"] = responseText;
        responseJson["raw"] = result;
        res.status(status_1.status.success).send(responseJson);
    }
    catch (err) {
        res.status(status_1.status.error).send(err.message);
        console.log({ err });
    }
});
function getText(textAnchor) {
    var _a;
    if (((_a = textAnchor === null || textAnchor === void 0 ? void 0 : textAnchor.textSegments) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        const startIndex = textAnchor.textSegments[0].startIndex || 0;
        const endIndex = textAnchor.textSegments[0].endIndex;
        return fullText.substring(startIndex, endIndex);
    }
    return "[NO TEXT]";
}
const parsingForm = (pages) => {
    const formInPages = [];
    let responseForm = [];
    pages.forEach((page, pageIndex) => {
        const { formFields } = page;
        responseForm = [];
        for (const field of formFields) {
            const fieldName = getText(field.fieldName.textAnchor);
            const fieldNameBoundinng = field.fieldName.boundingPoly;
            const fieldValue = getText(field.fieldValue.textAnchor);
            const fieldValueBoundinng = field.fieldValue.boundingPoly;
            responseForm.push({
                key: fieldName,
                keyBoundingPoly: fieldNameBoundinng,
                value: fieldValue,
                valueBoundingPoly: fieldValueBoundinng,
            });
        }
        formInPages[pageIndex] = responseForm;
    });
    console.log({ formInPages });
    return formInPages;
};
const parsingTable = (pages) => {
    const tableInPages = [];
    let responseTable = [];
    pages.forEach((page, pageIndex) => {
        const tables = page.tables;
        console.log("pageIndex", pageIndex);
        responseTable = [];
        tables.forEach((table, index) => {
            const [headerRow] = table.headerRows;
            const headerResponse = [];
            for (const tableCell of headerRow.cells) {
                if (tableCell.layout.textAnchor.textSegments) {
                    const textAnchor = tableCell.layout.textAnchor;
                    const text = getText(textAnchor);
                    headerResponse.push(text);
                }
            }
            const bodyRows = table.bodyRows;
            const bodyResponse = [];
            bodyRows.forEach((row) => {
                for (const tableCell of row.cells) {
                    if (tableCell.layout.textAnchor.textSegments) {
                        const textAnchor = tableCell.layout.textAnchor;
                        const text = getText(textAnchor);
                        bodyResponse.push(text);
                    }
                }
            });
            const tableResponse = {
                header: headerResponse,
                body: bodyResponse,
            };
            responseTable[index] = tableResponse;
        });
        tableInPages[pageIndex] = responseTable;
    });
    return tableInPages;
};
//# sourceMappingURL=ocr-google.js.map