var interior = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.interior, color = _a.color, pattern = _a.pattern, patternColor = _a.patternColor;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Color: color,
                            Pattern: pattern,
                            PatternColor: patternColor
                        }
                    }]
            }
        };
    }
};
export default interior;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJpb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZmlsZXMveG1sL3N0eWxlcy9pbnRlcmlvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxJQUFNLFFBQVEsR0FBcUI7SUFDL0IsV0FBVyxFQUFYLFVBQVksZUFBMkI7UUFDN0IsSUFBQSxLQUFtQyxlQUFlLENBQUMsUUFBUyxFQUExRCxLQUFLLFdBQUEsRUFBRSxPQUFPLGFBQUEsRUFBRSxZQUFZLGtCQUE4QixDQUFDO1FBQ25FLE9BQU87WUFDSCxJQUFJLEVBQUUsVUFBVTtZQUNoQixVQUFVLEVBQUU7Z0JBQ1Isa0JBQWtCLEVBQUMsQ0FBQzt3QkFDaEIsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsR0FBRyxFQUFFOzRCQUNELEtBQUssRUFBRSxLQUFLOzRCQUNaLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixZQUFZLEVBQUUsWUFBWTt5QkFDN0I7cUJBQ0osQ0FBQzthQUNMO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFDO0FBRUYsZUFBZSxRQUFRLENBQUMifQ==