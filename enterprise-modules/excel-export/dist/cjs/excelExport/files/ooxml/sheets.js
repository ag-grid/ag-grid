"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sheet_1 = require("./sheet");
var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(sheet_1.default.getTemplate)
        };
    }
};
exports.default = sheetsFactory;
//# sourceMappingURL=sheets.js.map