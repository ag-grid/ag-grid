import xfFactory from './xf';
var cellStylesXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};
export default cellStylesXfsFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbFN0eWxlWGZzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3N0eWxlcy9jZWxsU3R5bGVYZnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFpQixNQUFNLE1BQU0sQ0FBQztBQUVyQyxJQUFNLG9CQUFvQixHQUF1QjtJQUM3QyxXQUFXLEVBQVgsVUFBWSxHQUFTO1FBQ2pCLE9BQU87WUFDSCxJQUFJLEVBQUUsY0FBYztZQUNwQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTTtpQkFDcEI7YUFDSjtZQUNELFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBekIsQ0FBeUIsQ0FBQztTQUNyRCxDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLG9CQUFvQixDQUFDIn0=