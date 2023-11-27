"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sheet_1 = require("./sheet");
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(function (sheet, idx) { return sheet_1.default.getTemplate(sheet, idx); })
        };
    }
};
exports.default = sheetsFactory;
