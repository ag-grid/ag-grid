import borderFactory from './border';
var bordersFactory = {
    getTemplate: function (borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(function (border) { return borderFactory.getTemplate(border); })
        };
    }
};
export default bordersFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9yZGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvYm9yZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLGFBQWEsTUFBTSxVQUFVLENBQUM7QUFFckMsSUFBTSxjQUFjLEdBQXVCO0lBQ3ZDLFdBQVcsRUFBWCxVQUFZLE9BQW9CO1FBQzVCLE9BQU87WUFDSCxJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRTtnQkFDUixNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNO2lCQUN4QjthQUNKO1lBQ0QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFqQyxDQUFpQyxDQUFDO1NBQ3JFLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsY0FBYyxDQUFDIn0=