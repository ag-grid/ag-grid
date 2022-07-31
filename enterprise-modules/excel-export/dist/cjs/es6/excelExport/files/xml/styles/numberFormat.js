"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = numberFormat;
