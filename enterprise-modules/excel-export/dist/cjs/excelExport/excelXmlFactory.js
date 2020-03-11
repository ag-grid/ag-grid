"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var core_2 = require("@ag-grid-community/core");
var workbook_1 = require("./files/xml/workbook");
var excelWorkbook_1 = require("./files/xml/excelWorkbook");
var worksheet_1 = require("./files/xml/worksheet");
var documentProperties_1 = require("./files/xml/documentProperties");
var alignment_1 = require("./files/xml/styles/alignment");
var borders_1 = require("./files/xml/styles/borders");
var font_1 = require("./files/xml/styles/font");
var interior_1 = require("./files/xml/styles/interior");
var protection_1 = require("./files/xml/styles/protection");
var numberFormat_1 = require("./files/xml/styles/numberFormat");
var style_1 = require("./files/xml/styles/style");
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = /** @class */ (function () {
    function ExcelXmlFactory() {
    }
    ExcelXmlFactory.prototype.createExcel = function (styles, worksheets, sharedStrings) {
        var header = this.excelXmlHeader();
        var docProps = documentProperties_1.default.getTemplate();
        var eWorkbook = excelWorkbook_1.default.getTemplate();
        var wb = this.workbook(docProps, eWorkbook, styles, worksheets);
        return "" + header + this.xmlFactory.createXml(wb, function (boolean) { return boolean ? '1' : '0'; });
    };
    ExcelXmlFactory.prototype.workbook = function (docProperties, eWorkbook, styles, worksheets) {
        var children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheets.map(function (it) { return worksheet_1.default.getTemplate(it); }));
        return core_1._.assign({}, workbook_1.default.getTemplate(), { children: children });
    };
    ExcelXmlFactory.prototype.excelXmlHeader = function () {
        return "<?xml version=\"1.0\" ?>\n        <?mso-application progid=\"Excel.Sheet\" ?>\n        ";
    };
    ExcelXmlFactory.prototype.stylesXmlElement = function (styles) {
        var _this = this;
        return {
            name: 'Styles',
            children: styles ? styles.map(function (it) { return _this.styleXmlElement(it); }) : []
        };
    };
    ExcelXmlFactory.prototype.styleXmlElement = function (styleProperties) {
        var children = core_1._.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return core_1._.assign({}, style_1.default.getTemplate(styleProperties), { children: children });
    };
    ExcelXmlFactory.prototype.addProperty = function (property, styleProperties) {
        return function (children) {
            if (!styleProperties[property]) {
                return children;
            }
            var options = {
                alignment: alignment_1.default,
                borders: borders_1.default,
                font: font_1.default,
                interior: interior_1.default,
                numberFormat: numberFormat_1.default,
                protection: protection_1.default
            };
            return children.concat(options[property].getTemplate(styleProperties));
        };
    };
    __decorate([
        core_2.Autowired('xmlFactory')
    ], ExcelXmlFactory.prototype, "xmlFactory", void 0);
    ExcelXmlFactory = __decorate([
        core_2.Bean('excelXmlFactory')
    ], ExcelXmlFactory);
    return ExcelXmlFactory;
}());
exports.ExcelXmlFactory = ExcelXmlFactory;
//# sourceMappingURL=excelXmlFactory.js.map