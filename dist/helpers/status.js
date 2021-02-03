"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessage = exports.successMessage = exports.status = void 0;
const successMessage = { status: 200, data: {} };
exports.successMessage = successMessage;
const errorMessage = { status: 500 };
exports.errorMessage = errorMessage;
const status = {
    success: 200,
    ongoing: 202,
    bad: 400,
    unauthorized: 401,
    conflict: 409,
    badlogin: 403,
    notfound: 404,
    error: 500,
};
exports.status = status;
//# sourceMappingURL=status.js.map