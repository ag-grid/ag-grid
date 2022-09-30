"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sheet_1 = require("./sheet");
const sheetsFactory = {
    getTemplate(names) {
        return {
            name: "sheets",
            children: names.map((sheet, idx) => sheet_1.default.getTemplate(sheet, idx))
        };
    }
};
exports.default = sheetsFactory;
