import fs from "fs";
import multer from "multer";
import path from "path";
import moment from "moment";

const createDirIfNotExist = async (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createMulter = (allowedTypes = [], fileSize = 4096 * 4096) => {
  const storage = multer.diskStorage({
    destination: (_, __, cb) => {
      try {
        const destinationPath = path.join(`./public/uploads/`);
        createDirIfNotExist(destinationPath);
        cb(null, destinationPath);
      } catch (error) {
        cb(new Error("Error when choosing destination field"), "");
      }
    },
    filename: (req, file, cb) => {
      try {
        const filext = file.originalname.substring(
          file.originalname.lastIndexOf(".")
        );
        if (req.body.documentNumber) {
          cb(null, `${req.body.uploadAt}-${req.body.documentNumber}` + filext);
        } else {
          cb(null, moment().unix() + "_" + file.originalname);
        }
      } catch (error) {
        // cb(new Error("Error when generating file name"));
      }
    },
  });

  return multer({
    fileFilter: (_, file, cb) => {
      const ext = path.extname(file.originalname);
      let valid = true;

      if (allowedTypes.length > 0) {
        allowedTypes.forEach((type) => {
          if (ext !== type) {
            valid = false;
          }
        });
        if (!valid) {
          return cb(new Error("File not supported"));
        }
      }

      cb(null, true);
    },
    storage,
    limits: { fileSize },
  });
};

export default createMulter;
