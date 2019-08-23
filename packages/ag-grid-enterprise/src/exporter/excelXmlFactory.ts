import { XmlElement, XmlFactory, _ } from 'ag-grid-community';
import { Bean, Autowired } from 'ag-grid-community';

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

import { ExcelStyle, ExcelWorksheet, ExcelXMLTemplate } from 'ag-grid-community';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
@Bean('excelXmlFactory')
export class ExcelXmlFactory {

    @Autowired('xmlFactory') private xmlFactory: XmlFactory;

    public createExcel(styles: ExcelStyle[], worksheets: ExcelWorksheet[], sharedStrings?: string[]): string {
        const header = this.excelXmlHeader();
        const docProps = documentProperties.getTemplate();
        const eWorkbook = excelWorkbook.getTemplate();
        const wb = this.workbook(docProps, eWorkbook, styles, worksheets);

        return `${header}${this.xmlFactory.createXml(wb, boolean => boolean ? '1' : '0')}`;
    }

    private workbook(docProperties: XmlElement, eWorkbook: XmlElement, styles: ExcelStyle[], worksheets: ExcelWorksheet[]) : XmlElement {
        const children : XmlElement [] = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(_.map(worksheets, (it):XmlElement => worksheet.getTemplate(it)));

        return _.assign({}, workbook.getTemplate(), {children});
    }

    private excelXmlHeader() : string {
        return `<?xml version="1.0" ?>
        <?mso-application progid="Excel.Sheet" ?>
        `;
    }

    private stylesXmlElement(styles:ExcelStyle[]):XmlElement {
        return {
            name:'Styles',
            children:styles ? _.map(styles, (it) => {
                return this.styleXmlElement (it);
            }) : []
        };
    }

    private styleXmlElement(styleProperties:ExcelStyle):XmlElement {
        const children = _.compose(
            this.addProperty('alignment', styleProperties),
            this.addProperty('borders', styleProperties),
            this.addProperty('font', styleProperties),
            this.addProperty('interior', styleProperties),
            this.addProperty('protection', styleProperties),
            this.addProperty('numberFormat', styleProperties)
        )([]);

        return _.assign({}, style.getTemplate(styleProperties), {children});
    }

    private addProperty<K extends keyof ExcelStyle>(property: K, styleProperties: ExcelStyle) {
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
