"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var protection = {
    getTemplate: function (styleProperties) {
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
//# sourceMappingURL=protection.js.map