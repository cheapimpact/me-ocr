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
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const moment_1 = __importDefault(require("moment"));
const createDirIfNotExist = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const createMulter = (allowedTypes = [], fileSize = 4096 * 4096) => {
    const storage = multer_1.default.diskStorage({
        destination: (_, __, cb) => {
            try {
                const destinationPath = path_1.default.join(`./public/uploads/`);
                createDirIfNotExist(destinationPath);
                cb(null, destinationPath);
            }
            catch (error) {
                cb(new Error("Error when choosing destination field"), "");
            }
        },
        filename: (req, file, cb) => {
            try {
                const filext = file.originalname.substring(file.originalname.lastIndexOf("."));
                if (req.body.documentNumber) {
                    cb(null, `${req.body.uploadAt}-${req.body.documentNumber}` + filext);
                }
                else {
                    cb(null, moment_1.default().unix() + "_" + file.originalname);
                }
            }
            catch (error) {
            }
        },
    });
    return multer_1.default({
        fileFilter: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
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
exports.default = createMulter;
//# sourceMappingURL=multer.js.map