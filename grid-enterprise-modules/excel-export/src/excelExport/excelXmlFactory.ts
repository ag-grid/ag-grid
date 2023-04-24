import {
    ExcelStyle,
    ExcelWorksheet,
    ExcelXMLTemplate,
    ExcelFactoryMode,
    XmlElement,
    _
} from '@ag-grid-community/core';

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
export class ExcelXmlFactory {
    public static factoryMode: ExcelFactoryMode = ExcelFactoryMode.SINGLE_SHEET;

    public static createExcel(styles: ExcelStyle[], currentWorksheet: ExcelWorksheet): string {
        const header = this.excelXmlHeader();
        const docProps = documentProperties.getTemplate();
        const eWorkbook = excelWorkbook.getTemplate();
        const wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);

        return `${header}${XmlFactory.createXml(wb, boolean => boolean ? '1' : '0')}`;
    }

    private static workbook(docProperties: XmlElement, eWorkbook: XmlElement, styles: ExcelStyle[], currentWorksheet: ExcelWorksheet): XmlElement {
        const children: XmlElement[] = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet.getTemplate(currentWorksheet));

        return Object.assign({}, workbook.getTemplate(), {children});
    }

    private static excelXmlHeader(): string {
        return `<?xml version="1.0" ?>
        <?mso-application progid="Excel.Sheet" ?>
        `;
    }

    private static stylesXmlElement(styles:ExcelStyle[]): XmlElement {
        return {
            name: 'Styles',
            children:styles ? styles.map(it => this.styleXmlElement(it)) : []
        };
    }

    private static styleXmlElement(styleProperties: ExcelStyle): XmlElement {
        const children = _.compose(
            this.addProperty('alignment', styleProperties),
            this.addProperty('borders', styleProperties),
            this.addProperty('font', styleProperties),
            this.addProperty('interior', styleProperties),
            this.addProperty('protection', styleProperties),
            this.addProperty('numberFormat', styleProperties)
        )([]);

        return Object.assign({}, style.getTemplate(styleProperties), {children});
    }

    private static addProperty<K extends keyof ExcelStyle>(property: K, styleProperties: ExcelStyle) {
        return (children: XmlElement[]) => {
            if (!styleProperties[property]) { return children; }

            const options: { [s: string]: ExcelXMLTemplate } = {
                alignment,
                borders,
                font,
                interior,
                numberFormat,
                protection
            };

            return children.concat(options[property].getTemplate(styleProperties));
        };
    }
}
