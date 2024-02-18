const contentTypeFactory = {
    getTemplate(config) {
        const { name, ContentType, Extension, PartName } = config;
        return {
            name,
            properties: {
                rawMap: {
                    Extension,
                    PartName,
                    ContentType
                }
            }
        };
    }
};
export default contentTypeFactory;
