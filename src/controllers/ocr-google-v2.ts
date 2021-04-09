// DOCUMENTAI
// https://github.com/googleapis/nodejs-document-ai
import { NextFunction, Request, Response } from "express";
import { status } from "../helpers/status";
import createMulter from "../helpers/multer";
// import fs from "fs";
const fs = require("fs").promises;

import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */
const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.GCP_PROJECT_LOCATION; // Format is 'us' or 'eu'
console.log("process.env.GCP_PROJECT_ID", process.env.GCP_PROJECT_ID);
// const processorId = "60260ea83758b9fa"; // Create processor in Cloud Console (OCR)
const processorId = "d4e1081fac839298"; // Create processor in Cloud Console {FORM PARSER}
const upload = createMulter();

const client = new DocumentProcessorServiceClient({
  apiEndpoint: `${location}-documentai.googleapis.com`,
  keyFilename: "GCPKey.json",
});

export const ocrWithGCP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.single("file")(req, res, async (_: any) => {
    const { file } = req;
    if (!file) {
      const error = new Error("Please upload a file");
      return next(error);
    }
    // const fileName = file.filename;
    const filePath = file.path;
    try {
      const resJSON = await doOCR(filePath);
      res.status(status.success).send(resJSON);
    } catch (err) {
      res.status(status.error).send(err.message);
    }
  });
};
const doOCR = async (filePath: string) => {
  try {
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Process the output
    const responseJson: any = {};

    // Read the file into memory.
    const imageFile = await fs.readFile(filePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString("base64");

    const request = {
      name,
      document: {
        content: encodedImage,
        mimeType: "application/pdf",
      },
    };

    // Recognizes text entities in the PDF document
    const [result]: any = await client.processDocument(request);
    const { document }: any = result;
    // Get all of the document text as one big string
    const { text, pages }: any = document;
    responseJson["text"] = text;
    // Extract shards from the text field
    const getText = (textAnchor: any) => {
      if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return "";
      }
      // First shard in document doesn't have startIndex property
      const startIndex = textAnchor.textSegments[0].startIndex || 0;
      const endIndex = textAnchor.textSegments[0].endIndex;
      return text.substring(startIndex, endIndex);
    };
    // Read the text recognition output from the processor
    // console.log("The document pages: ", pages);
    const textInParagraphs: Array<object> = [];
    const formInPages: Array<object> = [];
    const tableInPages: Array<object> = [];
    pages.forEach((page: any, pageIndex: number) => {
      const formValue: Array<object> = [];
      const tableValue: Array<object> = [];

      const { paragraphs, formFields, tables } = page;
      // getting value from paragraphs
      for (const paragraph of paragraphs) {
        const paragraphText = getText(paragraph.layout.textAnchor);
        const paragraphTextBoundinng = paragraph.layout.boundingPoly;
        textInParagraphs.push({
          text: paragraphText,
          boundingPoly: paragraphTextBoundinng,
        });
      }
      // // getting value from formFields
      // console.log({ page });
      for (const field of formFields) {
        const fieldName = getText(field.fieldName.textAnchor);
        const fieldNameBoundinng = field.fieldName.boundingPoly;
        const fieldValue = getText(field.fieldValue.textAnchor);
        const fieldValueBoundinng = field.fieldValue.boundingPoly;
        formValue.push({
          key: fieldName,
          keyBoundingPoly: fieldNameBoundinng,
          value: fieldValue,
          valueBoundingPoly: fieldValueBoundinng,
        });
      }
      formInPages[pageIndex] = formValue;

      // TABLE GAN

      tables.forEach((table: any, i: number) => {
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
        tableValue[i] = tableResponse;
      });
      tableInPages[pageIndex] = tableValue;
    });
    responseJson["textInParagraphs"] = textInParagraphs;
    responseJson["data_form"] = formInPages;
    responseJson["data_table"] = tableInPages;
    responseJson["data_text"] = text.split("\n");
    responseJson["raw"] = document;
    return responseJson;
  } catch (err) {
    return Promise.reject(err);
    // res.status(status.error).send(err.message);
    // console.log({ err });
  }
};
