// ag-grid-enterprise v19.1.3
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
