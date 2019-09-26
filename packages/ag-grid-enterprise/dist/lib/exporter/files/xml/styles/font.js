// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var font = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.font, bold = _a.bold, fontName = _a.fontName, italic = _a.italic, color = _a.color, outline = _a.outline, shadow = _a.shadow, size = _a.size, strikeThrough = _a.strikeThrough, underline = _a.underline, verticalAlign = _a.verticalAlign, charSet = _a.charSet, family = _a.family;
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
