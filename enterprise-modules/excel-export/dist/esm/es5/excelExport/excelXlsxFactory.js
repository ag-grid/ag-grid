var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
var ExcelXlsxFactory = /** @class */ (function () {
    function ExcelXlsxFactory() {
    }
    ExcelXlsxFactory.createExcel = function (styles, worksheet, margins, pageSetup, headerFooterConfig) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, margins, pageSetup, headerFooterConfig);
    };
    ExcelXlsxFactory.buildImageMap = function (image, rowIndex, col, columnsToExport, rowHeight) {
        var currentSheetIndex = this.sheetNames.length;
        var registeredImage = this.images.get(image.id);
        if (!image.position || !image.position.row || !image.position.column) {
            if (!image.position) {
                image.position = {};
            }
            image.position = Object.assign({}, image.position, {
                row: rowIndex,
                column: columnsToExport.indexOf(col) + 1
            });
        }
        var calculatedImage = image;
        setExcelImageTotalWidth(calculatedImage, columnsToExport);
        setExcelImageTotalHeight(calculatedImage, rowHeight);
        if (registeredImage) {
            var currentSheetImages = registeredImage.find(function (currentImage) { return currentImage.sheetId === currentSheetIndex; });
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
    };
    ExcelXlsxFactory.buildSheetImageMap = function (sheetIndex, image) {
        var worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);
        if (!worksheetImageIdMap) {
            worksheetImageIdMap = new Map();
            this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
        }
        var sheetImages = this.worksheetImages.get(sheetIndex);
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
    };
    ExcelXlsxFactory.addSheetName = function (worksheet) {
        var name = _.escapeString(worksheet.name) || '';
        var append = '';
        while (this.sheetNames.indexOf("" + name + append) !== -1) {
            if (append === '') {
                append = '_1';
            }
            else {
                var curr = parseInt(append.slice(1), 10);
                append = "_" + (curr + 1);
            }
        }
        worksheet.name = "" + name + append;
        this.sheetNames.push(worksheet.name);
    };
    ExcelXlsxFactory.getStringPosition = function (str) {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str);
        }
        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    };
    ExcelXlsxFactory.resetFactory = function () {
        this.sharedStrings = new Map();
        this.images = new Map();
        this.worksheetImages = new Map();
        this.workbookImageIds = new Map();
        this.worksheetImageIds = new Map();
        this.sheetNames = [];
        this.factoryMode = ExcelFactoryMode.SINGLE_SHEET;
    };
    ExcelXlsxFactory.createWorkbook = function () {
        return createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    };
    ExcelXlsxFactory.createStylesheet = function (defaultFontSize) {
        return createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    };
    ExcelXlsxFactory.createSharedStrings = function () {
        return createXmlPart(sharedStringsFactory.getTemplate(this.sharedStrings));
    };
    ExcelXlsxFactory.createCore = function (author) {
        return createXmlPart(coreFactory.getTemplate(author));
    };
    ExcelXlsxFactory.createContentTypes = function (sheetLen) {
        return createXmlPart(contentTypesFactory.getTemplate(sheetLen));
    };
    ExcelXlsxFactory.createRels = function () {
        var rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml'
            }]);
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createTheme = function () {
        return createXmlPart(officeThemeFactory.getTemplate());
    };
    ExcelXlsxFactory.createWorkbookRels = function (sheetLen) {
        var worksheets = new Array(sheetLen).fill(undefined).map(function (v, i) { return ({
            Id: "rId" + (i + 1),
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: "worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var rs = relationshipsFactory.getTemplate(__spread(worksheets, [
            {
                Id: "rId" + (sheetLen + 1),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: "rId" + (sheetLen + 2),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: "rId" + (sheetLen + 3),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }
        ]));
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createDrawing = function (sheetIndex) {
        return createXmlPart(drawingFactory.getTemplate({ sheetIndex: sheetIndex }));
    };
    ExcelXlsxFactory.createDrawingRel = function (sheetIndex) {
        var _this = this;
        var worksheetImageIds = this.worksheetImageIds.get(sheetIndex);
        var XMLArr = [];
        worksheetImageIds.forEach(function (value, key) {
            XMLArr.push({
                Id: "rId" + (value.index + 1),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: "../media/image" + (_this.workbookImageIds.get(key).index + 1) + "." + value.type
            });
        });
        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    };
    ExcelXlsxFactory.createWorksheetDrawingRel = function (currentRelationIndex) {
        var rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
                Target: "../drawings/drawing" + (currentRelationIndex + 1) + ".xml"
            }]);
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createWorksheet = function (worksheet, margins, pageSetup, headerFooterConfig) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet: worksheet,
            currentSheet: this.sheetNames.length - 1,
            margins: margins,
            pageSetup: pageSetup,
            headerFooterConfig: headerFooterConfig
        }));
    };
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
    return ExcelXlsxFactory;
}());
export { ExcelXlsxFactory };
