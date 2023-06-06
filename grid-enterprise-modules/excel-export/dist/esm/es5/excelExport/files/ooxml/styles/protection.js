var protectionFactory = {
    getTemplate: function (protection) {
        var locked = protection.protected === false ? 0 : 1;
        var hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden: hidden,
                    locked: locked
                }
            }
        };
    }
};
export default protectionFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9maWxlcy9vb3htbC9zdHlsZXMvcHJvdGVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLGlCQUFpQixHQUF1QjtJQUMxQyxXQUFXLEVBQVgsVUFBWSxVQUEyQjtRQUNuQyxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE9BQU87WUFDSCxJQUFJLEVBQUUsWUFBWTtZQUNsQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLE1BQU0sUUFBQTtvQkFDTixNQUFNLFFBQUE7aUJBQ1Q7YUFDSjtTQUNKLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQztBQUVGLGVBQWUsaUJBQWlCLENBQUMifQ==