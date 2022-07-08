"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const font = {
    getTemplate(styleProperties) {
        const { bold, fontName, italic, color, outline, shadow, size, strikeThrough, underline, verticalAlign, charSet, family, } = styleProperties.font;
        return {
            name: "Font",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Bold: bold,
                            FontName: fontName,
                            Italic: italic,
                            Color: color,
                            Outline: outline,
                            Shadow: shadow,
                            Size: size,
                            StrikeThrough: strikeThrough,
                            Underline: underline,
                            VerticalAlign: verticalAlign
                        }
                    }, {
                        prefix: "x:",
                        map: {
                            CharSet: charSet,
                            Family: family
                        }
                    }]
            }
        };
    }
};
exports.default = font;
