import { ExcelFactoryMode, _ } from '@ag-grid-community/core';
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
import { XmlFactory } from "@ag-grid-community/csv-export";
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = /** @class */ (function () {
    function ExcelXmlFactory() {
    }
    ExcelXmlFactory.createExcel = function (styles, currentWorksheet) {
        var header = this.excelXmlHeader();
        var docProps = documentProperties.getTemplate();
        var eWorkbook = excelWorkbook.getTemplate();
        var wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return "" + header + XmlFactory.createXml(wb, function (boolean) { return boolean ? '1' : '0'; });
    };
    ExcelXmlFactory.workbook = function (docProperties, eWorkbook, styles, currentWorksheet) {
        var children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet.getTemplate(currentWorksheet));
        return Object.assign({}, workbook.getTemplate(), { children: children });
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
        var children = _.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style.getTemplate(styleProperties), { children: children });
    };
    ExcelXmlFactory.addProperty = function (property, styleProperties) {
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
    ExcelXmlFactory.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    return ExcelXmlFactory;
}());
export { ExcelXmlFactory };
