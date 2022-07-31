"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var excelExportModule_1 = require("./excelExportModule");
exports.ExcelExportModule = excelExportModule_1.ExcelExportModule;
var excelCreator_1 = require("./excelExport/excelCreator");
exports.getMultipleSheetsAsExcel = excelCreator_1.getMultipleSheetsAsExcel;
exports.exportMultipleSheetsAsExcel = excelCreator_1.exportMultipleSheetsAsExcel;
