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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbWxGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsWG1sRmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBSUgsZ0JBQWdCLEVBRWhCLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFDO0FBQzVDLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RELE9BQU8sU0FBUyxNQUFNLHVCQUF1QixDQUFDO0FBQzlDLE9BQU8sa0JBQWtCLE1BQU0sZ0NBQWdDLENBQUM7QUFFaEUsT0FBTyxTQUFTLE1BQU0sOEJBQThCLENBQUM7QUFDckQsT0FBTyxPQUFPLE1BQU0sNEJBQTRCLENBQUM7QUFDakQsT0FBTyxJQUFJLE1BQU0seUJBQXlCLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0sNkJBQTZCLENBQUM7QUFDbkQsT0FBTyxVQUFVLE1BQU0sK0JBQStCLENBQUM7QUFDdkQsT0FBTyxZQUFZLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxLQUFLLE1BQU0sMEJBQTBCLENBQUM7QUFFN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRTNEOztHQUVHO0FBQ0g7SUFBQTtJQWdFQSxDQUFDO0lBN0RpQiwyQkFBVyxHQUF6QixVQUEwQixNQUFvQixFQUFFLGdCQUFnQztRQUM1RSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckMsSUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEQsSUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzlDLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENB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