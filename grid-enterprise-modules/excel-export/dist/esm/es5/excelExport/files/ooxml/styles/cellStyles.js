import cellStyleFactory from './cellStyle';
var cellStylesFactory = {
    getTemplate: function (cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(function (cellStyle) { return cellStyleFactory.getTemplate(cellStyle); })
        };
    }
};
export default cellStylesFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvY2VsbFN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLGdCQUErQixNQUFNLGFBQWEsQ0FBQztBQUUxRCxJQUFNLGlCQUFpQixHQUF1QjtJQUMxQyxXQUFXLEVBQVgsVUFBWSxVQUF1QjtRQUMvQixPQUFPO1lBQ0gsSUFBSSxFQUFFLFlBQVk7WUFDbEIsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsVUFBVSxDQUFDLE1BQU07aUJBQzNCO2FBQ0o7WUFDRCxRQUFRLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBdkMsQ0FBdUMsQ0FBQztTQUNqRixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGlCQUFpQixDQUFDIn0=