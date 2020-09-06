var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub } from '@ag-grid-community/core';
import coreFactory from './files/ooxml/core';
import contentTypesFactory from './files/ooxml/contentTypes';
import officeThemeFactory from './files/ooxml/themes/office';
import sharedStringsFactory from './files/ooxml/sharedStrings';
import stylesheetFactory, { registerStyles } from './files/ooxml/styles/stylesheet';
import workbookFactory from './files/ooxml/workbook';
import worksheetFactory from './files/ooxml/worksheet';
import relationshipsFactory from './files/ooxml/relationships';
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
var ExcelXlsxFactory = /** @class */ (function (_super) {
    __extends(ExcelXlsxFactory, _super);
    function ExcelXlsxFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sharedStrings = [];
        return _this;
    }
    ExcelXlsxFactory.prototype.createSharedStrings = function () {
        return this.createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
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
        registerStyles(styles);
        return this.createWorksheet(worksheets);
    };
    ExcelXlsxFactory.prototype.createCore = function () {
        return this.createXmlPart(coreFactory.getTemplate());
    };
    ExcelXlsxFactory.prototype.createContentTypes = function () {
        return this.createXmlPart(contentTypesFactory.getTemplate());
    };
    ExcelXlsxFactory.prototype.createRels = function () {
        var rs = relationshipsFactory.getTemplate([{
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
        return this.createXmlPart(stylesheetFactory.getTemplate());
    };
    ExcelXlsxFactory.prototype.createTheme = function () {
        return this.createXmlPart(officeThemeFactory.getTemplate());
    };
    ExcelXlsxFactory.prototype.createWorkbook = function () {
        return this.createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    };
    ExcelXlsxFactory.prototype.createWorkbookRels = function () {
        var rs = relationshipsFactory.getTemplate([{
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
        return this.createXmlPart(worksheetFactory.getTemplate(worksheets[0]));
    };
    __decorate([
        Autowired('xmlFactory')
    ], ExcelXlsxFactory.prototype, "xmlFactory", void 0);
    ExcelXlsxFactory = __decorate([
        Bean('excelXlsxFactory')
    ], ExcelXlsxFactory);
    return ExcelXlsxFactory;
}(BeanStub));
export { ExcelXlsxFactory };
