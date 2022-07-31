"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protection = {
    getTemplate(styleProperties) {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Protected: styleProperties.protection.protected,
                            HideFormula: styleProperties.protection.hideFormula
                        }
                    }]
            }
        };
    }
};
exports.default = protection;
