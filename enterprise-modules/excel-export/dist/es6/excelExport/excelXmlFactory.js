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
import { _ } from '@ag-grid-community/core';
import { Bean, BeanStub, Autowired } from '@ag-grid-community/core';
import workbook from './files/xml/workbook';
import excelWorkbook from './files/xml/excelWorkbook';
import worksheet from './files/xml/worksheet';
import documentProperties from './files/xml/documentProperties';
import alignment from './files/xml/styles/alignment';
import borders from './files/xml/styles/borders';
import font from './files/xml/styles/font';
import interior from './files/xml/styles/interior';
import protection from './files/xml/styles/protection';
import numberFormat from './files/xml/styles/numberFormat';
import style from './files/xml/styles/style';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = /** @class */ (function (_super) {
    __extends(ExcelXmlFactory, _super);
    function ExcelXmlFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelXmlFactory.prototype.createExcel = function (styles, worksheets, sharedStrings) {
        var header = this.excelXmlHeader();
        var docProps = documentProperties.getTemplate();
        var eWorkbook = excelWorkbook.getTemplate();
        var wb = this.workbook(docProps, eWorkbook, styles, worksheets);
        return "" + header + this.xmlFactory.createXml(wb, function (boolean) { return boolean ? '1' : '0'; });
    };
    ExcelXmlFactory.prototype.workbook = function (docProperties, eWorkbook, styles, worksheets) {
        var children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheets.map(function (it) { return worksheet.getTemplate(it); }));
        return _.assign({}, workbook.getTemplate(), { children: children });
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
        var children = _.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return _.assign({}, style.getTemplate(styleProperties), { children: children });
    };
    ExcelXmlFactory.prototype.addProperty = function (property, styleProperties) {
        return function (children) {
            if (!styleProperties[property]) {
                return children;
            }
            var options = {
                alignment: alignment,
                borders: borders,
                font: font,
                interior: interior,
                numberFormat: numberFormat,
                protection: protection
            };
            return children.concat(options[property].getTemplate(styleProperties));
        };
    };
    __decorate([
        Autowired('xmlFactory')
    ], ExcelXmlFactory.prototype, "xmlFactory", void 0);
    ExcelXmlFactory = __decorate([
        Bean('excelXmlFactory')
    ], ExcelXmlFactory);
    return ExcelXmlFactory;
}(BeanStub));
export { ExcelXmlFactory };
