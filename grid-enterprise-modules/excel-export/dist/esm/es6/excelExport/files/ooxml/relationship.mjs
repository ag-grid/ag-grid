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
