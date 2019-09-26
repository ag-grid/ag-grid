// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cell = {
    getTemplate: function (c) {
        var mergeAcross = c.mergeAcross, styleId = c.styleId, data = c.data;
        var properties = {};
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
