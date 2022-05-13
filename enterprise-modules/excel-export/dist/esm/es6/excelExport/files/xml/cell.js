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
                                    Type: data.type
                                }
                            }]
                    },
                    textNode: data.value
                }]
        };
    }
};
export default cell;
//# sourceMappingURL=cell.js.map