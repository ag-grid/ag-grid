import borderFactory from './border';
const bordersFactory = {
    getTemplate(borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(border => borderFactory.getTemplate(border))
        };
    }
};
export default bordersFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvYm9yZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLGFBQWEsTUFBTSxVQUFVLENBQUM7QUFFckMsTUFBTSxjQUFjLEdBQXVCO0lBQ3ZDLFdBQVcsQ0FBQyxPQUFvQjtRQUM1QixPQUFPO1lBQ0gsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTTtpQkFDeEI7YUFDSjtZQUNELFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyRSxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLGNBQWMsQ0FBQyJ9