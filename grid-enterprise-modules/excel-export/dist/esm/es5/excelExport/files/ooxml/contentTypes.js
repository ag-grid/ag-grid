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
        var children = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(imageTypes)), [
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
        ]), __read(worksheets)), [
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
        ]), __read(imageDocs)), [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudFR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL2NvbnRlbnRUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLGtCQUFrQixNQUFNLGVBQWUsQ0FBQztBQUUvQyxJQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxXQUFXLEVBQVgsVUFBWSxRQUFnQjtRQUV4QixJQUFNLFVBQVUsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUM7WUFDbEUsSUFBSSxFQUFFLFVBQVU7WUFDaEIsV0FBVyxFQUFFLDJFQUEyRTtZQUN4RixRQUFRLEVBQUUsMEJBQXVCLENBQUMsR0FBRyxDQUFDLFVBQU07U0FDL0MsQ0FBQyxFQUptRSxDQUluRSxDQUFDLENBQUM7UUFFSixJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDL0QsSUFBTSxnQkFBZ0IsR0FBZ0MsRUFBRSxDQUFDO1FBRXpELGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUM7WUFDeEMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDO1lBQ3pFLElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSwyREFBMkQ7WUFDeEUsUUFBUSxFQUFFLDBCQUF1QixDQUFDLEdBQUcsQ0FBQyxVQUFNO1NBQy9DLENBQUMsRUFKMEUsQ0FJMUUsQ0FBQyxDQUFDO1FBRUosSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLENBQUM7WUFDekQsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsV0FBUyxHQUFLO1lBQzNCLFNBQVMsRUFBRSxHQUFHO1NBQ2pCLENBQUMsRUFKMEQsQ0FJMUQsQ0FBQyxDQUFDO1FBRUosSUFBTSxRQUFRLEdBQUcsK0ZBQ1YsVUFBVTtZQUNiO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixXQUFXLEVBQUUsMERBQTBEO2FBQzFFLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsV0FBVyxFQUFFLGlCQUFpQjtnQkFDOUIsU0FBUyxFQUFFLEtBQUs7YUFDbkIsRUFBRTtnQkFDQyxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsV0FBVyxFQUFFLDRFQUE0RTtnQkFDekYsUUFBUSxFQUFFLGtCQUFrQjthQUMvQjttQkFDRSxVQUFVO1lBQ2I7Z0JBQ0ksSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFdBQVcsRUFBRSx5REFBeUQ7Z0JBQ3RFLFFBQVEsRUFBRSxzQkFBc0I7YUFDbkMsRUFBRTtnQkFDQyxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsV0FBVyxFQUFFLHdFQUF3RTtnQkFDckYsUUFBUSxFQUFFLGdCQUFnQjthQUM3QixFQUFFO2dCQUNDLElBQUksRUFBRSxVQUFVO2dCQUNoQixXQUFXLEVBQUUsK0VBQStFO2dCQUM1RixRQUFRLEVBQUUsdUJBQXVCO2FBQ3BDO21CQUNFLFNBQVM7WUFDWjtnQkFDSSxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsV0FBVyxFQUFFLDREQUE0RDtnQkFDekUsUUFBUSxFQUFFLG9CQUFvQjthQUNqQztXQUNILEdBQUcsQ0FBQyxVQUFBLFdBQVcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO1FBRWxFLE9BQU87WUFDSCxJQUFJLEVBQUUsT0FBTztZQUNiLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLDhEQUE4RDtpQkFDeEU7YUFDSjtZQUNELFFBQVEsVUFBQTtTQUNYLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsbUJBQW1CLENBQUMifQ==