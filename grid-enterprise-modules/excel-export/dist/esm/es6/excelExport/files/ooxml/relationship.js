const relationshipFactory = {
    getTemplate(config) {
        const { Id, Type, Target } = config;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id,
                    Type,
                    Target
                }
            }
        };
    }
};
export default relationshipFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsYXRpb25zaGlwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3JlbGF0aW9uc2hpcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLG1CQUFtQixHQUF1QjtJQUM1QyxXQUFXLENBQUMsTUFBeUI7UUFDakMsTUFBTSxFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLE9BQU87WUFDSCxJQUFJLEVBQUUsY0FBYztZQUNwQixVQUFVLEVBQUU7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEVBQUU7b0JBQ0YsSUFBSTtvQkFDSixNQUFNO2lCQUNUO2FBQ0o7U0FDSixDQUFDO0lBQ04sQ0FBQztDQUNKLENBQUM7QUFFRixlQUFlLG1CQUFtQixDQUFDIn0=