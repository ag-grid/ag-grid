"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var csvCreator_1 = require("./csvExport/csvCreator");
var gridSerializer_1 = require("./csvExport/gridSerializer");
exports.CsvExportModule = {
    moduleName: core_1.ModuleNames.CsvExportModule,
    beans: [csvCreator_1.CsvCreator, gridSerializer_1.GridSerializer]
};
//# sourceMappingURL=csvExportModule.js.map