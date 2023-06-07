import { ExcelFactoryMode, _ } from '@ag-grid-community/core';
import coreFactory from './files/ooxml/core';
import contentTypesFactory from './files/ooxml/contentTypes';
import drawingFactory from './files/ooxml/drawing';
import officeThemeFactory from './files/ooxml/themes/office';
import sharedStringsFactory from './files/ooxml/sharedStrings';
import stylesheetFactory, { registerStyles } from './files/ooxml/styles/stylesheet';
import workbookFactory from './files/ooxml/workbook';
import worksheetFactory from './files/ooxml/worksheet';
import relationshipsFactory from './files/ooxml/relationships';
import { setExcelImageTotalHeight, setExcelImageTotalWidth, createXmlPart } from './assets/excelUtils';
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
export class ExcelXlsxFactory {
    static createExcel(styles, worksheet, config) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, config);
    }
    static buildImageMap(image, rowIndex, col, columnsToExport, rowHeight) {
        const currentSheetIndex = this.sheetNames.length;
        const registeredImage = this.images.get(image.id);
        if (!image.position || !image.position.row || !image.position.column) {
            if (!image.position) {
                image.position = {};
            }
            image.position = Object.assign({}, image.position, {
                row: rowIndex,
                column: columnsToExport.indexOf(col) + 1
            });
        }
        const calculatedImage = image;
        setExcelImageTotalWidth(calculatedImage, columnsToExport);
        setExcelImageTotalHeight(calculatedImage, rowHeight);
        if (registeredImage) {
            const currentSheetImages = registeredImage.find(currentImage => currentImage.sheetId === currentSheetIndex);
            if (currentSheetImages) {
                currentSheetImages.image.push(calculatedImage);
            }
            else {
                registeredImage.push({
                    sheetId: currentSheetIndex,
                    image: [calculatedImage]
                });
            }
        }
        else {
            this.images.set(calculatedImage.id, [{ sheetId: currentSheetIndex, image: [calculatedImage] }]);
            this.workbookImageIds.set(calculatedImage.id, { type: calculatedImage.imageType, index: this.workbookImageIds.size });
        }
        this.buildSheetImageMap(currentSheetIndex, calculatedImage);
    }
    static buildSheetImageMap(sheetIndex, image) {
        let worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);
        if (!worksheetImageIdMap) {
            worksheetImageIdMap = new Map();
            this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
        }
        const sheetImages = this.worksheetImages.get(sheetIndex);
        if (!sheetImages) {
            this.worksheetImages.set(sheetIndex, [image]);
            worksheetImageIdMap.set(image.id, { index: 0, type: image.imageType });
        }
        else {
            sheetImages.push(image);
            if (!worksheetImageIdMap.get(image.id)) {
                worksheetImageIdMap.set(image.id, { index: worksheetImageIdMap.size, type: image.imageType });
            }
        }
    }
    static addSheetName(worksheet) {
        const name = _.escapeString(worksheet.name) || '';
        let append = '';
        while (this.sheetNames.indexOf(`${name}${append}`) !== -1) {
            if (append === '') {
                append = '_1';
            }
            else {
                const curr = parseInt(append.slice(1), 10);
                append = `_${curr + 1}`;
            }
        }
        worksheet.name = `${name}${append}`;
        this.sheetNames.push(worksheet.name);
    }
    static getStringPosition(str) {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str);
        }
        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    }
    static resetFactory() {
        this.sharedStrings = new Map();
        this.images = new Map();
        this.worksheetImages = new Map();
        this.workbookImageIds = new Map();
        this.worksheetImageIds = new Map();
        this.sheetNames = [];
        this.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    }
    static createWorkbook() {
        return createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    }
    static createStylesheet(defaultFontSize) {
        return createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    }
    static createSharedStrings() {
        return createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
    }
    static createCore(author) {
        return createXmlPart(coreFactory.getTemplate(author));
    }
    static createContentTypes(sheetLen) {
        return createXmlPart(contentTypesFactory.getTemplate(sheetLen));
    }
    static createRels() {
        const rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml'
            }]);
        return createXmlPart(rs);
    }
    static createTheme() {
        return createXmlPart(officeThemeFactory.getTemplate());
    }
    static createWorkbookRels(sheetLen) {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            Id: `rId${i + 1}`,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: `worksheets/sheet${i + 1}.xml`
        }));
        const rs = relationshipsFactory.getTemplate([
            ...worksheets,
            {
                Id: `rId${sheetLen + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: `rId${sheetLen + 2}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: `rId${sheetLen + 3}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }
        ]);
        return createXmlPart(rs);
    }
    static createDrawing(sheetIndex) {
        return createXmlPart(drawingFactory.getTemplate({ sheetIndex }));
    }
    static createDrawingRel(sheetIndex) {
        const worksheetImageIds = this.worksheetImageIds.get(sheetIndex);
        const XMLArr = [];
        worksheetImageIds.forEach((value, key) => {
            XMLArr.push({
                Id: `rId${value.index + 1}`,
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: `../media/image${this.workbookImageIds.get(key).index + 1}.${value.type}`
            });
        });
        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    }
    static createWorksheetDrawingRel(currentRelationIndex) {
        const rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
                Target: `../drawings/drawing${currentRelationIndex + 1}.xml`
            }]);
        return createXmlPart(rs);
    }
    static createWorksheet(worksheet, config) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet,
            currentSheet: this.sheetNames.length - 1,
            config
        }));
    }
}
ExcelXlsxFactory.sharedStrings = new Map();
ExcelXlsxFactory.sheetNames = [];
/** Maps images to sheet */
ExcelXlsxFactory.images = new Map();
/** Maps sheets to images */
ExcelXlsxFactory.worksheetImages = new Map();
/** Maps all workbook images to a global Id */
ExcelXlsxFactory.workbookImageIds = new Map();
/** Maps all sheet images to unique Ids */
ExcelXlsxFactory.worksheetImageIds = new Map();
ExcelXlsxFactory.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbHN4RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9leGNlbFhsc3hGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFSCxnQkFBZ0IsRUFNaEIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxXQUFXLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxtQkFBbUIsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLGNBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRCxPQUFPLGtCQUFrQixNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sb0JBQW9CLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxpQkFBaUIsRUFBRSxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sZUFBZSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sZ0JBQWdCLE1BQU0seUJBQXlCLENBQUM7QUFDdkQsT0FBTyxvQkFBb0IsTUFBTSw2QkFBNkIsQ0FBQztBQUUvRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFJdkc7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBZ0JsQixNQUFNLENBQUMsV0FBVyxDQUNyQixNQUFvQixFQUNwQixTQUF5QixFQUN6QixNQUFrQztRQUVsQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzdCLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUvQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTSxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQWlCLEVBQUUsUUFBZ0IsRUFB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