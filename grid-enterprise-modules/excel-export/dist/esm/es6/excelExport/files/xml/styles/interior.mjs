const interior = {
    getTemplate(styleProperties) {
        const { color, pattern, patternColor } = styleProperties.interior;
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
