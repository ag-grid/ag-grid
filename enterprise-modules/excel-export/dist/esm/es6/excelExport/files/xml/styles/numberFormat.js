const numberFormat = {
    getTemplate(styleProperties) {
        const { format } = styleProperties.numberFormat;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Format: format
                        }
                    }]
            }
        };
    }
};
export default numberFormat;
