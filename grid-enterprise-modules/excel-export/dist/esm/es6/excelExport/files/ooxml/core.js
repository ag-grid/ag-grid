const coreFactory = {
    getTemplate(author) {
        const dt = new Date();
        const jsonDate = dt.toJSON();
        return {
            name: 'cp:coreProperties',
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
                            dc: 'http://purl.org/dc/elements/1.1/',
                            dcterms: 'http://purl.org/dc/terms/',
                            dcmitype: 'http://purl.org/dc/dcmitype/',
                            xsi: 'http://www.w3.org/2001/XMLSchema-instance'
                        }
                    }]
            },
            children: [{
                    name: 'dc:creator',
                    textNode: author
                }, {
                    name: 'dc:title',
                    textNode: 'Workbook'
                }, {
                    name: 'dcterms:created',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }, {
                    name: 'dcterms:modified',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }]
        };
    }
};
export default coreFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9jb3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sV0FBVyxHQUF1QjtJQUNwQyxXQUFXLENBQUMsTUFBYztRQUN0QixNQUFNLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3RCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUU3QixPQUFPO1lBQ0gsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUUsQ0FBQzt3QkFDakIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLEdBQUcsRUFBRTs0QkFDRCxFQUFFLEVBQUUseUVBQXlFOzRCQUM3RSxFQUFFLEVBQUUsa0NBQWtDOzRCQUN0QyxPQUFPLEVBQUUsMkJBQTJCOzRCQUNwQyxRQUFRLEVBQUUsOEJBQThCOzRCQUN4QyxHQUFHLEVBQUUsMkNBQTJDO3lCQUNuRDtxQkFDSixDQUFDO2FBQ0w7WUFDRCxRQUFRLEVBQUUsQ0FBQztvQkFDUCxJQUFJLEVBQUUsWUFBWTtvQkFDbEIsUUFBUSxFQUFFLE1BQU07aUJBQ25CLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFFBQVEsRUFBRSxVQUFVO2lCQUN2QixFQUFFO29CQUNDLElBQUksRUFBRSxpQkFBaUI7b0JBQ3ZCLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osVUFBVSxFQUFFLGdCQUFnQjt5QkFDL0I7cUJBQ0o7b0JBQ0QsUUFBUSxFQUFFLFFBQVE7aUJBQ3JCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLGtCQUFrQjtvQkFDeEIsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0QkFDSixVQUFVLEVBQUUsZ0JBQWdCO3lCQUMvQjtxQkFDSjtvQkFDRCxRQUFRLEVBQUUsUUFBUTtpQkFDckIsQ0FBQztTQUNMLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsV0FBVyxDQUFDIn0=