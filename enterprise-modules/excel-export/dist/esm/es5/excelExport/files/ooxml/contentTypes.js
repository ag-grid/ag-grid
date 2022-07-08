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
import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import contentTypeFactory from './contentType';
var contentTypesFactory = {
    getTemplate: function (sheetLen) {
        var worksheets = new Array(sheetLen).fill(undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: "/xl/worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
        var imageTypesObject = {};
        ExcelXlsxFactory.workbookImageIds.forEach(function (v) {
            imageTypesObject[v.type] = true;
        });
        var imageDocs = new Array(sheetsWithImages).fill(undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: "/xl/drawings/drawing" + (i + 1) + ".xml"
        }); });
        var imageTypes = Object.keys(imageTypesObject).map(function (ext) { return ({
            name: 'Default',
            ContentType: "image/" + ext,
            Extension: ext
        }); });
        var children = __spread(imageTypes, [
            {
                name: 'Default',
                Extension: 'rels',
                ContentType: 'application/vnd.openxmlformats-package.relationships+xml'
            }, {
                name: 'Default',
                ContentType: 'application/xml',
                Extension: 'xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
                PartName: "/xl/workbook.xml"
            }
        ], worksheets, [
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
                PartName: '/xl/theme/theme1.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
                PartName: '/xl/styles.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
                PartName: '/xl/sharedStrings.xml'
            }
        ], imageDocs, [
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml'
            }
        ]).map(function (contentType) { return contentTypeFactory.getTemplate(contentType); });
        return {
            name: "Types",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/content-types"
                }
            },
            children: children
        };
    }
};
export default contentTypesFactory;
