// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interior = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.interior, color = _a.color, pattern = _a.pattern, patternColor = _a.patternColor;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Color: color,
                            Pattern: pattern,
                            PatternColor: patternColor
                        }
                    }]
            }
        };
    }
};
exports.default = interior;
