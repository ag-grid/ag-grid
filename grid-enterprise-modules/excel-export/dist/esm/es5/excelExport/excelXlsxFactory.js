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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
    ExcelXlsxFactory.createExcel = function (styles, worksheet, config) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, config);
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
        var rs = relationshipsFactory.getTemplate(__spreadArray(__spreadArray([], __read(worksheets)), [
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
    ExcelXlsxFactory.createWorksheet = function (worksheet, config) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet: worksheet,
            currentSheet: this.sheetNames.length - 1,
            config: config
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbHN4RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9leGNlbFhsc3hGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFFSCxnQkFBZ0IsRUFNaEIsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxXQUFXLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxtQkFBbUIsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLGNBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRCxPQUFPLGtCQUFrQixNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sb0JBQW9CLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxpQkFBaUIsRUFBRSxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sZUFBZSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sZ0JBQWdCLE1BQU0seUJBQXlCLENBQUM7QUFDdkQsT0FBTyxvQkFBb0IsTUFBTSw2QkFBNkIsQ0FBQztBQUUvRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFJdkc7O0dBRUc7QUFDSDtJQUFBO0lBa09BLENBQUM7SUFsTmlCLDRCQUFXLEdBQXpCLFVBQ0ksTUFBb0IsRUFDcEIsU0FBeUIsRUFDekIsTUFBa0M7UUFFbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QixjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0MsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRWEsOEJBQWEsR0FBM0IsVUFBNEIsS0FBaUIsRUFBRSxRQUFnQixFQUFFLEdBQVcsRUFBRSxlQUF5QixFQUFFLFNBQWtFO1FBQ3ZLLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDakQsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFBRSxLQUFLLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzthQUFFO1lBRTdDLEtBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDL0MsR0FBRyxFQUFFLFFBQVE7Z0JBQ2IsTUFBTSxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQzthQUMzQyxDQUFDLENBQUM7U0FDTjtRQUVELElBQU0sZUFBZSxHQUFHLEtBQTZCLENBQUM7UUFFdEQsdUJBQXVCLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzFELHdCQUF3QixDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUVyRCxJQUFJLGVBQWUsRUFBRTtZQUNqQixJQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBQSxZQUFZLElBQUksT0FBQSxZQUFZLENBQUMsT0FBTyxLQUFLLGlCQUFpQixFQUExQyxDQUEwQyxDQUFDLENBQUM7WUFDNUcsSUFBSSxrQkFBa0IsRUFBRTtnQkFDcEIsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUNsRDtpQkFBTTtnQkFDSCxlQUFlLENBQUMsSUFBSSxDQUFDO29CQUNqQixPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixLQUFLLEVBQUUsQ0FBQyxlQUFlLENBQUM7aUJBQzNCLENBQUMsQ0FBQzthQUNOO1NBQ0o7YUFBTTtZQUNILElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7U0FDekg7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVjLG1DQUFrQixHQUFqQyxVQUFrQyxVQUFrQixFQUFFLEtBQTJCO1FBQzdFLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDdEIsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUMxRTthQUFNO1lBQ0gsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDcEMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUNqRztTQUNKO0lBQ0wsQ0FBQztJQUVjLDZCQUFZLEdBQTNCLFVBQTRCLFNBQXlCO1FBQ2pELElBQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFaEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFHLElBQUksR0FBRyxNQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN2RCxJQUFJLE1BQU0sS0FBSyxFQUFFLEVBQUU7Z0JBQ2YsTUFBTSxHQUFHLElBQUksQ0FBQzthQUNqQjtpQkFBTTtnQkFDSCxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxHQUFHLE9BQUksSUFBSSxHQUFHLENBQUMsQ0FBRSxDQUFDO2FBQzNCO1NBQ0o7UUFFRCxTQUFTLENBQUMsSUFBSSxHQUFHLEtBQUcsSUFBSSxHQUFHLE1BQVEsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVhLGtDQUFpQixHQUEvQixVQUFnQyxHQUFXO1FBQ3ZDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztTQUN2QztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFYSw2QkFBWSxHQUExQjtRQUNJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRW5DLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO0lBQ3JELENBQUM7SUFFYSwrQkFBYyxHQUE1QjtRQUNJLE9BQU8sYUFBYSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVhLGlDQUFnQixHQUE5QixVQUErQixlQUF1QjtRQUNsRCxPQUFPLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRWEsb0NBQW1CLEdBQWpDO1FBQ0ksT0FBTyxhQUFhLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFYSwyQkFBVSxHQUF4QixVQUF5QixNQUFjO1FBQ25DLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRWEsbUNBQWtCLEdBQWhDLFVBQWlDLFFBQWdCO1FBQzdDLE9BQU8sYUFBYSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFYSwyQkFBVSxHQUF4QjtRQUNJLElBQU0sRUFBRSxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN6QyxFQUFFLEVBQUUsTUFBTTtnQkFDVixJQUFJLEVBQUUsb0ZBQW9GO2dCQUMxRixNQUFNLEVBQUUsaUJBQWlCO2FBQzVCLEVBQUU7Z0JBQ0MsRUFBRSxFQUFFLE1BQU07Z0JBQ1YsSUFBSSxFQUFFLHVGQUF1RjtnQkFDN0YsTUFBTSxFQUFFLG1CQUFtQjthQUM5QixDQUFDLENBQUMsQ0FBQztRQUVKLE9BQU8sYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFYSw0QkFBVyxHQUF6QjtRQUNJLE9BQU8sYUFBYSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVhLG1DQUFrQixHQUFoQyxVQUFpQyxRQUFnQjtRQUM3QyxJQUFNLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUM7WUFDbEUsRUFBRSxFQUFFLFNBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBRTtZQUNqQixJQUFJLEVBQUUsK0VBQStFO1lBQ3JGLE1BQU0sRUFBRSxzQkFBbUIsQ0FBQyxHQUFHLENBQUMsVUFBTTtTQUN6QyxDQUFDLEVBSm1FLENBSW5FLENBQUMsQ0FBQztRQUVKLElBQU0sRUFBRSxHQUFHLG9CQUFvQixDQUFDLFdBQVcsd0NBQ3BDLFVBQVU7WUFDakI7Z0JBQ0ksRUFBRSxFQUFFLFNBQU0sUUFBUSxHQUFHLENBQUMsQ0FBRTtnQkFDeEIsSUFBSSxFQUFFLDJFQUEyRTtnQkFDakYsTUFBTSxFQUFFLGtCQUFrQjthQUM3QixFQUFFO2dCQUNDLEVBQUUsRUFBRSxTQUFNLFFBQVEsR0FBRyxDQUFDLENBQUU7Z0JBQ3hCLElBQUksRUFBRSw0RUFBNEU7Z0JBQ2xGLE1BQU0sRUFBRSxZQUFZO2FBQ3ZCLEVBQUU7Z0JBQ0MsRUFBRSxFQUFFLFNBQU0sUUFBUSxHQUFHLENBQUMsQ0FBRTtnQkFDeEIsSUFBSSxFQUFFLG1GQUFtRjtnQkFDekYsTUFBTSxFQUFFLG1CQUFtQjthQUM5QjtXQUFFLENBQUM7UUFFSixPQUFPLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRWEsOEJBQWEsR0FBM0IsVUFBNEIsVUFBa0I7UUFDMUMsT0FBTyxhQUFhLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFYSxpQ0FBZ0IsR0FBOUIsVUFBK0IsVUFBa0I7UUFBakQsaUJBYUM7UUFaRyxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakUsSUFBTSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztRQUV2QyxpQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRztZQUNsQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNSLEVBQUUsRUFBRSxTQUFNLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFFO2dCQUMzQixJQUFJLEVBQUUsMkVBQTJFO2dCQUNqRixNQUFNLEVBQUUsb0JBQWlCLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUMsS0FBSyxHQUFHLENBQUMsVUFBSSxLQUFLLENBQUMsSUFBTTthQUNyRixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sYUFBYSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFYSwwQ0FBeUIsR0FBdkMsVUFBd0Msb0JBQTRCO1FBQ2hFLElBQU0sRUFBRSxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN6QyxFQUFFLEVBQUUsTUFBTTtnQkFDVixJQUFJLEVBQUUsNkVBQTZFO2dCQUNuRixNQUFNLEVBQUUseUJBQXNCLG9CQUFvQixHQUFHLENBQUMsVUFBTTthQUMvRCxDQUFDLENBQUMsQ0FBQztRQUVKLE9BQU8sYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFYyxnQ0FBZSxHQUE5QixVQUNJLFNBQXlCLEVBQ3pCLE1BQWtDO1FBRWxDLE9BQU8sYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztZQUM5QyxTQUFTLFdBQUE7WUFDVCxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUN4QyxNQUFNLFFBQUE7U0FDVCxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUEvTmMsOEJBQWEsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUMvQywyQkFBVSxHQUFhLEVBQUUsQ0FBQztJQUV6QywyQkFBMkI7SUFDYix1QkFBTSxHQUFzRSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3BHLDRCQUE0QjtJQUNkLGdDQUFlLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDL0UsOENBQThDO0lBQ2hDLGlDQUFnQixHQUFlLElBQUksR0FBRyxFQUFFLENBQUM7SUFDdkQsMENBQTBDO0lBQzVCLGtDQUFpQixHQUE0QixJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXZELDRCQUFXLEdBQXFCLGdCQUFnQixDQUFDLFlBQVksQ0FBQztJQW9OaEYsdUJBQUM7Q0FBQSxBQWxPRCxJQWtPQztTQWxPWSxnQkFBZ0IifQ==