import sheetsFactory from './sheets';
var workbookFactory = {
    getTemplate: function (names) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Jvb2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMvb294bWwvd29ya2Jvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxhQUFhLE1BQU0sVUFBVSxDQUFDO0FBRXJDLElBQU0sZUFBZSxHQUF1QjtJQUN4QyxXQUFXLEVBQVgsVUFBWSxLQUFlO1FBRXZCLE9BQU87WUFDSCxJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUMsQ0FBQzt3QkFDaEIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLEdBQUcsRUFBRTs0QkFDRCxDQUFDLEVBQUUscUVBQXFFO3lCQUMzRTtxQkFDSixDQUFDO2dCQUNGLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsMkRBQTJEO2lCQUNyRTthQUNKO1lBQ0QsUUFBUSxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQyxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGVBQWUsQ0FBQyJ9