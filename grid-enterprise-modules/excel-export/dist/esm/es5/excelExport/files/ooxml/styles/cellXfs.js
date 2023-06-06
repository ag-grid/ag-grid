import xfFactory from './xf';
var cellXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};
export default cellXfsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFhmcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvY2VsbFhmcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQWlCLE1BQU0sTUFBTSxDQUFDO0FBRXJDLElBQU0sY0FBYyxHQUF1QjtJQUN2QyxXQUFXLEVBQVgsVUFBWSxHQUFTO1FBQ2pCLE9BQU87WUFDSCxJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNO2lCQUNwQjthQUNKO1lBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxTQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUF6QixDQUF5QixDQUFDO1NBQ3JELENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsY0FBYyxDQUFDIn0=