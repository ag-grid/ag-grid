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
export class ExcelXmlFactory {
    static createExcel(styles, currentWorksheet) {
        const header = this.excelXmlHeader();
        const docProps = documentProperties.getTemplate();
        const eWorkbook = excelWorkbook.getTemplate();
        const wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return `${header}${XmlFactory.createXml(wb, boolean => boolean ? '1' : '0')}`;
    }
    static workbook(docProperties, eWorkbook, styles, currentWorksheet) {
        const children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet.getTemplate(currentWorksheet));
        return Object.assign({}, workbook.getTemplate(), { children });
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
        const children = _.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style.getTemplate(styleProperties), { children });
    }
    static addProperty(property, styleProperties) {
        return (children) => {
            if (!styleProperties[property]) {
                return children;
            }
            const options = {
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
ExcelXmlFactory.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbWxGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsWG1sRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBSUgsZ0JBQWdCLEVBRWhCLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFDO0FBQzVDLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RELE9BQU8sU0FBUyxNQUFNLHVCQUF1QixDQUFDO0FBQzlDLE9BQU8sa0JBQWtCLE1BQU0sZ0NBQWdDLENBQUM7QUFFaEUsT0FBTyxTQUFTLE1BQU0sOEJBQThCLENBQUM7QUFDckQsT0FBTyxPQUFPLE1BQU0sNEJBQTRCLENBQUM7QUFDakQsT0FBTyxJQUFJLE1BQU0seUJBQXlCLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0sNkJBQTZCLENBQUM7QUFDbkQsT0FBTyxVQUFVLE1BQU0sK0JBQStCLENBQUM7QUFDdkQsT0FBTyxZQUFZLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxLQUFLLE1BQU0sMEJBQTBCLENBQUM7QUFFN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRTNEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFHakIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFvQixFQUFFLGdCQUFnQztRQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEQsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENB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