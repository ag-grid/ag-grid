import sheetsFactory from './sheets';
const workbookFactory = {
    getTemplate(names) {
        return {
            name: "workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        },
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: [sheetsFactory.getTemplate(names)]
        };
    }
};
export default workbookFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Jvb2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvd29ya2Jvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxhQUFhLE1BQU0sVUFBVSxDQUFDO0FBRXJDLE1BQU0sZUFBZSxHQUF1QjtJQUN4QyxXQUFXLENBQUMsS0FBZTtRQUV2QixPQUFPO1lBQ0gsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFDLENBQUM7d0JBQ2hCLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixHQUFHLEVBQUU7NEJBQ0QsQ0FBQyxFQUFFLHFFQUFxRTt5QkFDM0U7cUJBQ0osQ0FBQztnQkFDRixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLDJEQUEyRDtpQkFDckU7YUFDSjtZQUNELFFBQVEsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxlQUFlLENBQUMifQ==