// ag-grid-enterprise v21.2.2
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ag_grid_community_1 = require("ag-grid-community");
var core_1 = require("./files/ooxml/core");
var contentTypes_1 = require("./files/ooxml/contentTypes");
var office_1 = require("./files/ooxml/themes/office");
var sharedStrings_1 = require("./files/ooxml/sharedStrings");
var stylesheet_1 = require("./files/ooxml/styles/stylesheet");
var workbook_1 = require("./files/ooxml/workbook");
var worksheet_1 = require("./files/ooxml/worksheet");
var relationships_1 = require("./files/ooxml/relationships");
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
var ExcelXlsxFactory = /** @class */ (function () {
    function ExcelXlsxFactory() {
        this.sharedStrings = [];
    }
    ExcelXlsxFactory.prototype.createSharedStrings = function () {
        return this.createXmlPart(sharedStrings_1.default.getTemplate(this.sharedStrings));
    };
    ExcelXlsxFactory.prototype.createXmlPart = function (body) {
        var header = this.xmlFactory.createHeader({
            encoding: 'UTF-8',
            standalone: 'yes'
        });
        var xmlBody = this.xmlFactory.createXml(body);
        return "" + header + xmlBody;
    };
    ExcelXlsxFactory.prototype.createExcel = function (styles, worksheets, sharedStrings) {
        if (sharedStrings === void 0) { sharedStrings = []; }
        this.sharedStrings = sharedStrings;
        this.sheetNames = worksheets.map(function (worksheet) { return worksheet.name; });
        stylesheet_1.registerStyles(styles);
        return this.createWorksheet(worksheets);
    };
    ExcelXlsxFactory.prototype.createCore = function () {
        return this.createXmlPart(core_1.default.getTemplate());
    };
    ExcelXlsxFactory.prototype.createContentTypes = function () {
        return this.createXmlPart(contentTypes_1.default.getTemplate());
    };
    ExcelXlsxFactory.prototype.createRels = function () {
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
    ExcelXlsxFactory.prototype.createStylesheet = function () {
        return this.createXmlPart(stylesheet_1.default.getTemplate());
    };
    ExcelXlsxFactory.prototype.createTheme = function () {
        return this.createXmlPart(office_1.default.getTemplate());
    };
    ExcelXlsxFactory.prototype.createWorkbook = function () {
        return this.createXmlPart(workbook_1.default.getTemplate(this.sheetNames));
    };
    ExcelXlsxFactory.prototype.createWorkbookRels = function () {
        var rs = relationships_1.default.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
                Target: 'worksheets/sheet1.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: 'rId3',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: 'rId4',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }]);
        return this.createXmlPart(rs);
    };
    ExcelXlsxFactory.prototype.createWorksheet = function (worksheets) {
        return this.createXmlPart(worksheet_1.default.getTemplate(worksheets[0]));
    };
    __decorate([
        ag_grid_community_1.Autowired('xmlFactory'),
        __metadata("design:type", ag_grid_community_1.XmlFactory)
    ], ExcelXlsxFactory.prototype, "xmlFactory", void 0);
    ExcelXlsxFactory = __decorate([
        ag_grid_community_1.Bean('excelXlsxFactory')
    ], ExcelXlsxFactory);
    return ExcelXlsxFactory;
}());
exports.ExcelXlsxFactory = ExcelXlsxFactory;
