var numberFormat = {
    getTemplate: function (styleProperties) {
        var format = styleProperties.numberFormat.format;
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
