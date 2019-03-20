// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var column = {
    getTemplate: function (c) {
        var width = c.width;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};
exports.default = column;
