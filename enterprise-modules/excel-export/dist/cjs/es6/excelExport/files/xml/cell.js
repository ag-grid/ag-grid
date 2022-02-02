"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = cell;
//# sourceMappingURL=cell.js.map