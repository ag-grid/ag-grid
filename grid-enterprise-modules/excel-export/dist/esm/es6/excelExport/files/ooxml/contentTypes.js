import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import contentTypeFactory from './contentType';
const contentTypesFactory = {
    getTemplate(sheetLen) {
        const worksheets = new Array(sheetLen).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: `/xl/worksheets/sheet${i + 1}.xml`
        }));
        const sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
        const imageTypesObject = {};
        ExcelXlsxFactory.workbookImageIds.forEach((v) => {
            imageTypesObject[v.type] = true;
        });
        const imageDocs = new Array(sheetsWithImages).fill(undefined).map((v, i) => ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: `/xl/drawings/drawing${i + 1}.xml`
        }));
        const imageTypes = Object.keys(imageTypesObject).map(ext => ({
            name: 'Default',
            ContentType: `image/${ext}`,
            Extension: ext
        }));
        const children = [
            ...imageTypes,
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
            },
            ...worksheets,
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
            },
            ...imageDocs,
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml'
            }
        ].map(contentType => contentTypeFactory.getTemplate(contentType));
        return {
            name: "Types",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/content-types"
                }
            },
            children
        };
    }
};
export default contentTypesFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudFR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL2NvbnRlbnRUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLGtCQUFrQixNQUFNLGVBQWUsQ0FBQztBQUUvQyxNQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxXQUFXLENBQUMsUUFBZ0I7UUFFeEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDbEUsSUFBSSxFQUFFLFVBQVU7WUFDaEIsV0FBVyxFQUFFLDJFQUEyRTtZQUN4RixRQUFRLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxDQUFDLE1BQU07U0FDL0MsQ0FBQyxDQUFDLENBQUM7UUFFSixNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUM7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBZ0MsRUFBRSxDQUFDO1FBRXpELGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQzVDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLElBQUksRUFBRSxVQUFVO1lBQ2hCLFdBQVcsRUFBRSwyREFBMkQ7WUFDeEUsUUFBUSxFQUFFLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxNQUFNO1NBQy9DLENBQUMsQ0FBQyxDQUFDO1FBRUosTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekQsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsU0FBUyxHQUFHLEVBQUU7WUFDM0IsU0FBUyxFQUFFLEdBQUc7U0FDakIsQ0FBQyxDQUFDLENBQUM7UUFFSixNQUFNLFFBQVEsR0FBRztZQUNiLEdBQUcsVUFBVTtZQUNiO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixXQUFXLEVBQUUsMERBQTBEO2FBQzFFLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsV0FBVyxFQUFFLGlCQUFpQjtnQkFDOUIsU0FBUyxFQUFFLEtBQUs7YUFDbkIsRUFBRTtnQkFDQyxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsV0FBVyxFQUFFLDRFQUE0RTtnQkFDekYsUUFBUSxFQUFFLGtCQUFrQjthQUMvQjtZQUNELEdBQUcsVUFBVTtZQUNiO2dCQUNJLElBQUksRUFBRSxVQUFVO2dCQUNoQixXQUFXLEVBQUUseURBQXlEO2dCQUN0RSxRQUFRLEVBQUUsc0JBQXNCO2FBQ25DLEVBQUU7Z0JBQ0MsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFdBQVcsRUFBRSx3RUFBd0U7Z0JBQ3JGLFFBQVEsRUFBRSxnQkFBZ0I7YUFDN0IsRUFBRTtnQkFDQyxJQUFJLEVBQUUsVUFBVTtnQkFDaEIsV0FBVyxFQUFFLCtFQUErRTtnQkFDNUYsUUFBUSxFQUFFLHVCQUF1QjthQUNwQztZQUNELEdBQUcsU0FBUztZQUNaO2dCQUNJLElBQUksRUFBRSxVQUFVO2dCQUNoQixXQUFXLEVBQUUsNERBQTREO2dCQUN6RSxRQUFRLEVBQUUsb0JBQW9CO2FBQ2pDO1NBQ0osQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUVsRSxPQUFPO1lBQ0gsSUFBSSxFQUFFLE9BQU87WUFDYixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSw4REFBOEQ7aUJBQ3hFO2FBQ0o7WUFDRCxRQUFRO1NBQ1gsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxtQkFBbUIsQ0FBQyJ9