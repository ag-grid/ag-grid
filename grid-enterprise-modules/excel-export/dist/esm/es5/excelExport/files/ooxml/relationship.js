var relationshipFactory = {
    getTemplate: function (config) {
        var Id = config.Id, Type = config.Type, Target = config.Target;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id: Id,
                    Type: Type,
                    Target: Target
                }
            }
        };
    }
};
export default relationshipFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXRpb25zaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3JlbGF0aW9uc2hpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxJQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxXQUFXLEVBQVgsVUFBWSxNQUF5QjtRQUMxQixJQUFBLEVBQUUsR0FBa0IsTUFBTSxHQUF4QixFQUFFLElBQUksR0FBWSxNQUFNLEtBQWxCLEVBQUUsTUFBTSxHQUFJLE1BQU0sT0FBVixDQUFXO1FBQ2xDLE9BQU87WUFDSCxJQUFJLEVBQUUsY0FBYztZQUNwQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEVBQUUsSUFBQTtvQkFDRixJQUFJLE1BQUE7b0JBQ0osTUFBTSxRQUFBO2lCQUNUO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLG1CQUFtQixDQUFDIn0=