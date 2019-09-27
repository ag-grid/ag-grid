// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var excelWorkbook = {
    getTemplate: function () {
        return {
            name: "ExcelWorkbook",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:excel"
                }
            },
            children: [{
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowWidth",
                    textNode: "15135"
                }, {
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowTopX",
                    textNode: "120"
                }, {
                    name: "WindowTopY",
                    textNode: "45"
                }, {
                    name: "ProtectStructure",
                    textNode: "False"
                }, {
                    name: "ProtectWindow",
                    textNode: "False"
                }]
        };
    }
};
exports.default = excelWorkbook;
