"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = numberFormat;
//# sourceMappingURL=numberFormat.js.map