"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMultipleSheetsAsExcel = exports.getMultipleSheetsAsExcel = exports.ExcelExportModule = void 0;
var excelExportModule_1 = require("./excelExportModule");
Object.defineProperty(exports, "ExcelExportModule", { enumerable: true, get: function () { return excelExportModule_1.ExcelExportModule; } });
var excelCreator_1 = require("./excelExport/excelCreator");
Object.defineProperty(exports, "getMultipleSheetsAsExcel", { enumerable: true, get: function () { return excelCreator_1.getMultipleSheetsAsExcel; } });
Object.defineProperty(exports, "exportMultipleSheetsAsExcel", { enumerable: true, get: function () { return excelCreator_1.exportMultipleSheetsAsExcel; } });
