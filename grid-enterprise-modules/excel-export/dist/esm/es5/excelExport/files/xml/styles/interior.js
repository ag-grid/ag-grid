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
export default interior;
