const borders = {
    getTemplate(styleProperties) {
        const { borderBottom, borderLeft, borderRight, borderTop } = styleProperties.borders;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map((it, index) => {
                const current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy94bWwvc3R5bGVzL2JvcmRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsTUFBTSxPQUFPLEdBQXFCO0lBQzlCLFdBQVcsQ0FBQyxlQUEyQjtRQUNuQyxNQUFNLEVBQ0YsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsU0FBUyxFQUNaLEdBQUcsZUFBZSxDQUFDLE9BQVEsQ0FBQztRQUM3QixPQUFPO1lBQ0gsSUFBSSxFQUFFLFNBQVM7WUFDZixRQUFRLEVBQUUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFlLEVBQUUsS0FBYSxFQUFFLEVBQUU7Z0JBQ2hHLE1BQU0sT0FBTyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDM0YsT0FBTztvQkFDSCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxVQUFVLEVBQUU7d0JBQ1Isa0JBQWtCLEVBQUUsQ0FBQztnQ0FDakIsTUFBTSxFQUFFLEtBQUs7Z0NBQ2IsR0FBRyxFQUFFO29DQUNELFFBQVEsRUFBRSxPQUFPO29DQUNqQixTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVM7b0NBQ3ZCLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtvQ0FDakIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO2lDQUNsQjs2QkFDSixDQUFDO3FCQUNMO2lCQUNKLENBQUM7WUFDTixDQUFDLENBQUM7U0FDTCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLE9BQU8sQ0FBQyJ9