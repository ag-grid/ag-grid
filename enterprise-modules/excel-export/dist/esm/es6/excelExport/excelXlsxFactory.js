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
    static createExcel(styles, worksheet, margins, pageSetup, headerFooterConfig) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, margins, pageSetup, headerFooterConfig);
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
    static createWorksheet(worksheet, margins, pageSetup, headerFooterConfig) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet,
            currentSheet: this.sheetNames.length - 1,
            margins,
            pageSetup,
            headerFooterConfig
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
