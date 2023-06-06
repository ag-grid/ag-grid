var borders = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.borders, borderBottom = _a.borderBottom, borderLeft = _a.borderLeft, borderRight = _a.borderRight, borderTop = _a.borderTop;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map(function (it, index) {
                var current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                return {
                    name: 'Border',
                    properties: {
                        prefixedAttributes: [{
                                prefix: 'ss:',
                                map: {
                                    Position: current,
                                    LineStyle: it.lineStyle,
                                    Weight: it.weight,
                                    Color: it.color
                                }
                            }]
                    }
                };
            })
        };
    }
};
export default borders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL2JvcmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsSUFBTSxPQUFPLEdBQXFCO0lBQzlCLFdBQVcsRUFBWCxVQUFZLGVBQTJCO1FBQzdCLElBQUEsS0FLRixlQUFlLENBQUMsT0FBUSxFQUp4QixZQUFZLGtCQUFBLEVBQ1osVUFBVSxnQkFBQSxFQUNWLFdBQVcsaUJBQUEsRUFDWCxTQUFTLGVBQ2UsQ0FBQztRQUM3QixPQUFPO1lBQ0gsSUFBSSxFQUFFLFNBQVM7WUFDZixRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFlLEVBQUUsS0FBYTtnQkFDNUYsSUFBTSxPQUFPLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUMzRixPQUFPO29CQUNILElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRTt3QkFDUixrQkFBa0IsRUFBRSxDQUFDO2dDQUNqQixNQUFNLEVBQUUsS0FBSztnQ0FDYixHQUFHLEVBQUU7b0NBQ0QsUUFBUSxFQUFFLE9BQU87b0NBQ2pCLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztvQ0FDdkIsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNO29DQUNqQixLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUs7aUNBQ2xCOzZCQUNKLENBQUM7cUJBQ0w7aUJBQ0osQ0FBQztZQUNOLENBQUMsQ0FBQztTQUNMLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsT0FBTyxDQUFDIn0=