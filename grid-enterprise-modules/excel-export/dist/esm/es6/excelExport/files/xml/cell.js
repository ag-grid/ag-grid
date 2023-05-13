const cell = {
    getTemplate(c) {
        const { mergeAcross, styleId, data } = c;
        const properties = {};
        if (mergeAcross) {
            properties.MergeAcross = mergeAcross;
        }
        if (styleId) {
            properties.StyleID = styleId;
        }
        return {
            name: "Cell",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: properties
                    }]
            },
            children: [{
                    name: "Data",
                    properties: {
                        prefixedAttributes: [{
                                prefix: "ss:",
                                map: {
                                    Type: data === null || data === void 0 ? void 0 : data.type
                                }
                            }]
                    },
                    textNode: data === null || data === void 0 ? void 0 : data.value
                }]
        };
    }
};
export default cell;
