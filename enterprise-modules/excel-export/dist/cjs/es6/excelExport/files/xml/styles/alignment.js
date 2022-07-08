"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alignment = {
    getTemplate(styleProperties) {
        const { vertical, horizontal, indent, readingOrder, rotate, shrinkToFit, verticalText, wrapText } = styleProperties.alignment;
        return {
            name: 'Alignment',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Vertical: vertical,
                            Horizontal: horizontal,
                            Indent: indent,
                            ReadingOrder: readingOrder,
                            Rotate: rotate,
                            ShrinkToFit: shrinkToFit,
                            VerticalText: verticalText,
                            WrapText: wrapText
                        }
                    }]
            }
        };
    }
};
exports.default = alignment;
