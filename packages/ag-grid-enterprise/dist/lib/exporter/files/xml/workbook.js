// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var workbook = {
    getTemplate: function () {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            o: "urn:schemas-microsoft-com:office:office",
                            x: "urn:schemas-microsoft-com:office:excel",
                            ss: "urn:schemas-microsoft-com:office:spreadsheet",
                            html: "http://www.w3.org/TR/REC-html40"
                        },
                    }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            }
        };
    }
};
exports.default = workbook;
