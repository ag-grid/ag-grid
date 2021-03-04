"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("./files/ooxml/core");
var contentTypes_1 = require("./files/ooxml/contentTypes");
var office_1 = require("./files/ooxml/themes/office");
var sharedStrings_1 = require("./files/ooxml/sharedStrings");
var stylesheet_1 = require("./files/ooxml/styles/stylesheet");
var workbook_1 = require("./files/ooxml/workbook");
var worksheet_1 = require("./files/ooxml/worksheet");
var relationships_1 = require("./files/ooxml/relationships");
var csv_export_1 = require("@ag-grid-community/csv-export");
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
var ExcelXlsxFactory = /** @class */ (function () {
    function ExcelXlsxFactory() {
    }
    ExcelXlsxFactory.createExcel = function (styles, worksheet) {
        this.addSheetName(worksheet);
        stylesheet_1.registerStyles(styles);
        return this.createWorksheet(worksheet);
    };
    ExcelXlsxFactory.addSheetName = function (worksheet) {
        var name = worksheet.name;
        var append = '';
        while (this.sheetNames.indexOf(name + append) !== -1) {
            if (append === '') {
                append = '_1';
            }
            else {
                var curr = parseInt(append.slice(1), 10);
                append = "_" + (curr + 1);
            }
        }
        worksheet.name += append;
        this.sheetNames.push(worksheet.name);
    };
    ExcelXlsxFactory.getStringPosition = function (str) {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str);
        }
        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    };
    ExcelXlsxFactory.resetFactory = function () {
        this.sharedStrings = new Map();
        this.sheetNames = [];
        this.factoryMode = core_1.ExcelFactoryMode.SINGLE_SHEET;
    };
    ExcelXlsxFactory.createWorkbook = function () {
        return this.createXmlPart(workbook_1.default.getTemplate(this.sheetNames));
    };
    ExcelXlsxFactory.createStylesheet = function (defaultFontSize) {
        return this.createXmlPart(stylesheet_1.default.getTemplate(defaultFontSize));
    };
    ExcelXlsxFactory.createSharedStrings = function () {
        return this.createXmlPart(sharedStrings_1.default.getTemplate(this.sharedStrings));
    };
    ExcelXlsxFactory.createCore = function (author) {
        return this.createXmlPart(core_2.default.getTemplate(author));
    };
    ExcelXlsxFactory.createContentTypes = function (sheetLen) {
        return this.createXmlPart(contentTypes_1.default.getTemplate(sheetLen));
    };
    ExcelXlsxFactory.createRels = function () {
        var rs = relationships_1.default.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml'
            }]);
        return this.createXmlPart(rs);
    };
    ExcelXlsxFactory.createTheme = function () {
        return this.createXmlPart(office_1.default.getTemplate());
    };
    ExcelXlsxFactory.createWorkbookRels = function (sheetLen) {
        var worksheets = new Array(sheetLen).fill(undefined).map(function (v, i) { return ({
            Id: "rId" + (i + 1),
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: "worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var rs = relationships_1.default.getTemplate(__spreadArrays(worksheets, [
            {
                Id: "rId" + (sheetLen + 1),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: "rId" + (sheetLen + 2),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: "rId" + (sheetLen + 3),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }
        ]));
        return this.createXmlPart(rs);
    };
    ExcelXlsxFactory.createXmlPart = function (body) {
        var header = csv_export_1.XmlFactory.createHeader({
            encoding: 'UTF-8',
            standalone: 'yes'
        });
        var xmlBody = csv_export_1.XmlFactory.createXml(body);
        return "" + header + xmlBody;
    };
    ExcelXlsxFactory.createWorksheet = function (worksheet) {
        return this.createXmlPart(worksheet_1.default.getTemplate(worksheet));
    };
    ExcelXlsxFactory.sharedStrings = new Map();
    ExcelXlsxFactory.sheetNames = [];
    ExcelXlsxFactory.factoryMode = core_1.ExcelFactoryMode.SINGLE_SHEET;
    return ExcelXlsxFactory;
}());
exports.ExcelXlsxFactory = ExcelXlsxFactory;
//# sourceMappingURL=excelXlsxFactory.js.map