"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var excelXlsxFactory_1 = require("../../excelXlsxFactory");
var contentType_1 = require("./contentType");
var contentTypesFactory = {
    getTemplate: function (sheetLen) {
        var worksheets = core_1._.fill(new Array(sheetLen), undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: "/xl/worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var sheetsWithImages = excelXlsxFactory_1.ExcelXlsxFactory.worksheetImages.size;
        var imageTypesObject = {};
        excelXlsxFactory_1.ExcelXlsxFactory.workbookImageIds.forEach(function (v) {
            imageTypesObject[v.type] = true;
        });
        var imageDocs = core_1._.fill(new Array(sheetsWithImages), undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: "/xl/drawings/drawing" + (i + 1) + ".xml"
        }); });
        var imageTypes = Object.keys(imageTypesObject).map(function (ext) { return ({
            name: 'Default',
            ContentType: "image/" + ext,
            Extension: ext
        }); });
        var children = __spreadArrays(imageTypes, [
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
        ]).map(function (contentType) { return contentType_1.default.getTemplate(contentType); });
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
exports.default = contentTypesFactory;
//# sourceMappingURL=contentTypes.js.map