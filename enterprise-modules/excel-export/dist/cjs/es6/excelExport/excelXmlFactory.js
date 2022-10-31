"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const workbook_1 = require("./files/xml/workbook");
const excelWorkbook_1 = require("./files/xml/excelWorkbook");
const worksheet_1 = require("./files/xml/worksheet");
const documentProperties_1 = require("./files/xml/documentProperties");
const alignment_1 = require("./files/xml/styles/alignment");
const borders_1 = require("./files/xml/styles/borders");
const font_1 = require("./files/xml/styles/font");
const interior_1 = require("./files/xml/styles/interior");
const protection_1 = require("./files/xml/styles/protection");
const numberFormat_1 = require("./files/xml/styles/numberFormat");
const style_1 = require("./files/xml/styles/style");
const csv_export_1 = require("@ag-grid-community/csv-export");
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
class ExcelXmlFactory {
    static createExcel(styles, currentWorksheet) {
        const header = this.excelXmlHeader();
        const docProps = documentProperties_1.default.getTemplate();
        const eWorkbook = excelWorkbook_1.default.getTemplate();
        const wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return `${header}${csv_export_1.XmlFactory.createXml(wb, boolean => boolean ? '1' : '0')}`;
    }
    static workbook(docProperties, eWorkbook, styles, currentWorksheet) {
        const children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet_1.default.getTemplate(currentWorksheet));
        return Object.assign({}, workbook_1.default.getTemplate(), { children });
    }
    static excelXmlHeader() {
        return `<?xml version="1.0" ?>
        <?mso-application progid="Excel.Sheet" ?>
        `;
    }
    static stylesXmlElement(styles) {
        return {
            name: 'Styles',
            children: styles ? styles.map(it => this.styleXmlElement(it)) : []
        };
    }
    static styleXmlElement(styleProperties) {
        const children = core_1._.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style_1.default.getTemplate(styleProperties), { children });
    }
    static addProperty(property, styleProperties) {
        return (children) => {
            if (!styleProperties[property]) {
                return children;
            }
            const options = {
                alignment: alignment_1.default,
                borders: borders_1.default,
                font: font_1.default,
                interior: interior_1.default,
                numberFormat: numberFormat_1.default,
                protection: protection_1.default
            };
            return children.concat(options[property].getTemplate(styleProperties));
        };
    }
}
exports.ExcelXmlFactory = ExcelXmlFactory;
ExcelXmlFactory.factoryMode = core_1.ExcelFactoryMode.SINGLE_SHEET;
