"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
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
var csv_export_1 = require("@ag-grid-community/csv-export");
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = /** @class */ (function () {
    function ExcelXmlFactory() {
    }
    ExcelXmlFactory.createExcel = function (styles, currentWorksheet) {
        var header = this.excelXmlHeader();
        var docProps = documentProperties_1.default.getTemplate();
        var eWorkbook = excelWorkbook_1.default.getTemplate();
        var wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return "" + header + csv_export_1.XmlFactory.createXml(wb, function (boolean) { return boolean ? '1' : '0'; });
    };
    ExcelXmlFactory.workbook = function (docProperties, eWorkbook, styles, currentWorksheet) {
        var children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet_1.default.getTemplate(currentWorksheet));
        return Object.assign({}, workbook_1.default.getTemplate(), { children: children });
    };
    ExcelXmlFactory.excelXmlHeader = function () {
        return "<?xml version=\"1.0\" ?>\n        <?mso-application progid=\"Excel.Sheet\" ?>\n        ";
    };
    ExcelXmlFactory.stylesXmlElement = function (styles) {
        var _this = this;
        return {
            name: 'Styles',
            children: styles ? styles.map(function (it) { return _this.styleXmlElement(it); }) : []
        };
    };
    ExcelXmlFactory.styleXmlElement = function (styleProperties) {
        var children = core_1._.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style_1.default.getTemplate(styleProperties), { children: children });
    };
    ExcelXmlFactory.addProperty = function (property, styleProperties) {
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
    ExcelXmlFactory.factoryMode = core_1.ExcelFactoryMode.SINGLE_SHEET;
    return ExcelXmlFactory;
}());
exports.ExcelXmlFactory = ExcelXmlFactory;
