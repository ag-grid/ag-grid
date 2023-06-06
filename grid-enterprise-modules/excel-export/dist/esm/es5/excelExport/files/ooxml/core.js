var coreFactory = {
    getTemplate: function (author) {
        var dt = new Date();
        var jsonDate = dt.toJSON();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9jb3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQU0sV0FBVyxHQUF1QjtJQUNwQyxXQUFXLEVBQVgsVUFBWSxNQUFjO1FBQ3RCLElBQU0sRUFBRSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdEIsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRTdCLE9BQU87WUFDSCxJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFVBQVUsRUFBRTtnQkFDUixrQkFBa0IsRUFBRSxDQUFDO3dCQUNqQixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsR0FBRyxFQUFFOzRCQUNELEVBQUUsRUFBRSx5RUFBeUU7NEJBQzdFLEVBQUUsRUFBRSxrQ0FBa0M7NEJBQ3RDLE9BQU8sRUFBRSwyQkFBMkI7NEJBQ3BDLFFBQVEsRUFBRSw4QkFBOEI7NEJBQ3hDLEdBQUcsRUFBRSwyQ0FBMkM7eUJBQ25EO3FCQUNKLENBQUM7YUFDTDtZQUNELFFBQVEsRUFBRSxDQUFDO29CQUNQLElBQUksRUFBRSxZQUFZO29CQUNsQixRQUFRLEVBQUUsTUFBTTtpQkFDbkIsRUFBRTtvQkFDQyxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsUUFBUSxFQUFFLFVBQVU7aUJBQ3ZCLEVBQUU7b0JBQ0MsSUFBSSxFQUFFLGlCQUFpQjtvQkFDdkIsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0QkFDSixVQUFVLEVBQUUsZ0JBQWdCO3lCQUMvQjtxQkFDSjtvQkFDRCxRQUFRLEVBQUUsUUFBUTtpQkFDckIsRUFBRTtvQkFDQyxJQUFJLEVBQUUsa0JBQWtCO29CQUN4QixVQUFVLEVBQUU7d0JBQ1IsTUFBTSxFQUFFOzRCQUNKLFVBQVUsRUFBRSxnQkFBZ0I7eUJBQy9CO3FCQUNKO29CQUNELFFBQVEsRUFBRSxRQUFRO2lCQUNyQixDQUFDO1NBQ0wsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxXQUFXLENBQUMifQ==