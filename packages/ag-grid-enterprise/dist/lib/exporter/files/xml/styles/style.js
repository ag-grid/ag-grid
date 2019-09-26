// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style = {
    getTemplate: function (styleProperties) {
        var id = styleProperties.id, name = styleProperties.name;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: id,
                            Name: name ? name : id
                        }
                    }]
            }
        };
    }
};
exports.default = style;
