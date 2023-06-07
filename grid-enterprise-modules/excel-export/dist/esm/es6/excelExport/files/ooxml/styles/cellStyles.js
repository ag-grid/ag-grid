import cellStyleFactory from './cellStyle';
const cellStylesFactory = {
    getTemplate(cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyle => cellStyleFactory.getTemplate(cellStyle))
        };
    }
};
export default cellStylesFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvY2VsbFN0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLGdCQUErQixNQUFNLGFBQWEsQ0FBQztBQUUxRCxNQUFNLGlCQUFpQixHQUF1QjtJQUMxQyxXQUFXLENBQUMsVUFBdUI7UUFDL0IsT0FBTztZQUNILElBQUksRUFBRSxZQUFZO1lBQ2xCLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLFVBQVUsQ0FBQyxNQUFNO2lCQUMzQjthQUNKO1lBQ0QsUUFBUSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDakYsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxpQkFBaUIsQ0FBQyJ9