"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sheets_1 = require("./sheets");
const workbookFactory = {
    getTemplate(names) {
        return {
            name: "workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        },
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: [sheets_1.default.getTemplate(names)]
        };
    }
};
exports.default = workbookFactory;
