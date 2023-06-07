var workbook = {
    getTemplate: function () {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            o: "urn:schemas-microsoft-com:office:office",
                            x: "urn:schemas-microsoft-com:office:excel",
                            ss: "urn:schemas-microsoft-com:office:spreadsheet",
                            html: "http://www.w3.org/TR/REC-html40"
                        },
                    }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            }
        };
    }
};
export default workbook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Jvb2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMveG1sL3dvcmtib29rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLElBQU0sUUFBUSxHQUFxQjtJQUMvQixXQUFXLEVBQVg7UUFDSSxPQUFPO1lBQ0gsSUFBSSxFQUFFLFVBQVU7WUFDaEIsVUFBVSxFQUFFO2dCQUNSLGtCQUFrQixFQUFDLENBQUM7d0JBQ2hCLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixHQUFHLEVBQUU7NEJBQ0QsQ0FBQyxFQUFFLHlDQUF5Qzs0QkFDNUMsQ0FBQyxFQUFFLHdDQUF3Qzs0QkFDM0MsRUFBRSxFQUFFLDhDQUE4Qzs0QkFDbEQsSUFBSSxFQUFFLGlDQUFpQzt5QkFDMUM7cUJBQ0osQ0FBQztnQkFDRixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLDhDQUE4QztpQkFDeEQ7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsUUFBUSxDQUFDIn0=