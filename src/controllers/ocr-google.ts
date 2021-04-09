// DOCUMENTAI
// https://github.com/googleapis/nodejs-document-ai
import { Storage } from "@google-cloud/storage";
// import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { NextFunction, Request, Response } from "express";
import { status } from "../helpers/status";
import createMulter from "../helpers/multer";
// import fs from "fs";

const {
  DocumentUnderstandingServiceClient,
} = require("@google-cloud/documentai");

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */

const projectId = "tesml-294814";
const location = "us"; // Format is 'us' or 'eu'
const bucketName = "ocr_bucket_nsw";
// const processorId = "586668a2c03e20cc"; // Create processor in Cloud Console
const upload = createMulter();

const client = new DocumentUnderstandingServiceClient({
  keyFilename: "APIKEY.json",
});
const storage = new Storage({
  keyFilename: "APIKEY.json",
});

let fullText = "";

export const ocrWithGCP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("file")(req, res, (_: any) => {
    const { file } = req;
    if (!file) {
      const error = new Error("Please upload a file");
      return next(error);
    }
    const fileName = file.filename;
    const filePath = file.path;
    // console.log({ fileName, filePath });
    uploadToBucket(res, filePath, fileName);
    // doOCR(filePath);
  });
};

const uploadToBucket = async (
  res: Response,
  filePath: string,
  fileName: string
) => {
  // Uploads a local file to the bucket
  // await storage.bucket(bucketName).upload(filePath, {});
  // const filePathGS = `${bucketName}/${fileName}`;
  // console.log({ filePathGS });

  // doOCR(res, filePathGS);
  // untuk testing biar ga spamming data ke bycket pak khilmi
  // doOCR(
  //   res,
  //   "ocr_bucket_nsw/1612336894_1._nilai_pabean_berdasarkan_nilai_transaksi_barang_impor_bersangkutan.pdf"
  // );
  // doOCR(res, "ocr_bucket_nsw/1611749371_UND26.pdf");
  doOCR(res, "ocr_bucket_nsw/1612406319_testfiel3.pdf");
};

const doOCR = async (res: Response, filePath: string) => {
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

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);
    console.log("jalan");

    // Get all of the document text as one big string
    const { text, pages } = result;

    fullText = text;

    // Process the output
    const responseJson: any = {};

    // for table
    const responseTable = parsingTable(pages);
    responseJson["file_url"] = "https://storage.cloud.google.com/" + filePath;
    responseJson["data_table"] = responseTable;

    //for form
    const responseForm = parsingForm(pages);
    responseJson["data_form"] = responseForm;

    //fulltext process
    const responseText = fullText.split("\n");
    responseJson["data_text"] = responseText;
    responseJson["raw"] = result;
    res.status(status.success).send(responseJson);
  } catch (err) {
    res.status(status.error).send(err.message);
    console.log({ err });
  }
};

function getText(textAnchor: any) {
  if (textAnchor?.textSegments?.length > 0) {
    const startIndex = textAnchor.textSegments[0].startIndex || 0;
    const endIndex = textAnchor.textSegments[0].endIndex;
    return fullText.substring(startIndex, endIndex);
  }
  return "[NO TEXT]";
}

const parsingForm = (pages: any) => {
  const formInPages: any = [];
  let responseForm = [];

  pages.forEach((page: any, pageIndex: number) => {
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

const parsingTable = (pages: any) => {
  const tableInPages: any = [];
  let responseTable: any = [];
  pages.forEach((page: any, pageIndex: number) => {
    const tables = page.tables;
    console.log("pageIndex", pageIndex);
    responseTable = [];

    tables.forEach((table: any, index: number) => {
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
      const bodyResponse: any = [];
      bodyRows.forEach((row: any) => {
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
