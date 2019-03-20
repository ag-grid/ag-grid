// ag-grid-enterprise v20.2.0
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
