import themeElements from './office/themeElements';
var officeTheme = {
    getTemplate: function () {
        return {
            name: "a:theme",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            a: "http://schemas.openxmlformats.org/drawingml/2006/main"
                        },
                    }],
                rawMap: {
                    name: "Office Theme"
                }
            },
            children: [
                themeElements.getTemplate(),
                {
                    name: 'a:objectDefaults'
                },
                {
                    name: 'a:extraClrSchemeLst'
                }
            ]
        };
    }
};
export default officeTheme;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmaWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3RoZW1lcy9vZmZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxhQUFhLE1BQU0sd0JBQXdCLENBQUM7QUFFbkQsSUFBTSxXQUFXLEdBQXVCO0lBQ3BDLFdBQVc7UUFFUCxPQUFPO1lBQ0gsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUMsQ0FBQzt3QkFDaEIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLEdBQUcsRUFBRTs0QkFDRCxDQUFDLEVBQUUsdURBQXVEO3lCQUM3RDtxQkFDSixDQUFDO2dCQUNGLE1BQU0sRUFBRTtvQkFDSixJQUFJLEVBQUUsY0FBYztpQkFDdkI7YUFDSjtZQUNELFFBQVEsRUFBRTtnQkFDTixhQUFhLENBQUMsV0FBVyxFQUFFO2dCQUMzQjtvQkFDSSxJQUFJLEVBQUUsa0JBQWtCO2lCQUMzQjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUscUJBQXFCO2lCQUM5QjthQUNKO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxXQUFXLENBQUMifQ==