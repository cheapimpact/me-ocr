// DOCUMENTAI
// https://github.com/googleapis/nodejs-document-ai
import { Storage } from "@google-cloud/storage";
// import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { NextFunction, Request, Response } from "express";
import createMulter from "../helpers/multer";
import fs from "fs";

const {
  DocumentProcessorServiceClient,
} = require("@google-cloud/documentai").v1beta3;

/**
 * TODO(developer): Uncomment these variables before running the sample.
 */

const projectId = "perceptive-map-291704";
const location = "eu"; // Format is 'us' or 'eu'
// const bucketName = "insw-ocr-bucket";
const processorId = "586668a2c03e20cc"; // Create processor in Cloud Console
const upload = createMulter();

const client = new DocumentProcessorServiceClient({
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
  upload.single("meocr")(req, res, (err: any) => {
    const { file } = req;
    if (!file) {
      const error = new Error("Please upload a file");
      return next(error);
    }
    const fileName = file.filename;
    const filePath = file.path;
    // console.log({ fileName, filePath });
    // uploadToBucket(res, filePath, fileName);
    doScan(filePath);
  });
};

const uploadToBucket = async (
  res: Response,
  filePath: string,
  fileName: string
) => {
  // Uploads a local file to the bucket
  await storage.bucket(bucketName).upload(filePath, {});
  const filePathGS = `${bucketName}/${fileName}`;
  console.log({ filePathGS });

  // console.log(gcsInputUri);
  //   generate(res, filePathGS);
};

const doScan = async (filePath: string) => {
  try {
    // Configure the request for processing the PDF
    // const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
    // const name = `projects/148978327527/locations/us/processors/ff9482add0f72fd5`;
    const name = `//eu-documentai.googleapis.com/v1beta3/projects/148978327527/locations/eu/processors/586668a2c03e20cc`;
    // const name = client.processorPath(projectId, location, processorId);

    // Read the file into memory.
    const imageFile = await fs.promises.readFile(filePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString("base64");

    const request = {
      name,
      document: {
        content: encodedImage,
        mimeType: "application/pdf",
      },
    };
    console.log({});

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument({
      name:
        "https://eu-documentai.googleapis.com/v1beta3/projects/148978327527/locations/eu/processors/586668a2c03e20cc:process",
      document: {
        content: encodedImage,
        mimeType: "application/pdf",
      },
    });
    console.log("jalan");

    const { document }: any = result;
    const { text }: any = document;
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
    console.log("The document contains the following paragraphs:");
    const [page1] = document.pages;
    const { paragraphs } = page1;

    for (const paragraph of paragraphs) {
      const paragraphText = getText(paragraph.layout.textAnchor);
      console.log(`Paragraph text:\n${paragraphText}`);
    }
  } catch (err) {
    console.log({ err });
  }
};
