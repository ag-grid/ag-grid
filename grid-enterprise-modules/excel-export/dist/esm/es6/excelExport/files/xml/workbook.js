const workbook = {
    getTemplate() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Jvb2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMveG1sL3dvcmtib29rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE1BQU0sUUFBUSxHQUFxQjtJQUMvQixXQUFXO1FBQ1AsT0FBTztZQUNILElBQUksRUFBRSxVQUFVO1lBQ2hCLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBQyxDQUFDO3dCQUNoQixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsR0FBRyxFQUFFOzRCQUNELENBQUMsRUFBRSx5Q0FBeUM7NEJBQzVDLENBQUMsRUFBRSx3Q0FBd0M7NEJBQzNDLEVBQUUsRUFBRSw4Q0FBOEM7NEJBQ2xELElBQUksRUFBRSxpQ0FBaUM7eUJBQzFDO3FCQUNKLENBQUM7Z0JBQ0YsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSw4Q0FBOEM7aUJBQ3hEO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLFFBQVEsQ0FBQyJ9