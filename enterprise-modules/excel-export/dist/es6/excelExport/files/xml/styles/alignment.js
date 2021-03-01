var alignment = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.alignment, vertical = _a.vertical, horizontal = _a.horizontal, indent = _a.indent, readingOrder = _a.readingOrder, rotate = _a.rotate, shrinkToFit = _a.shrinkToFit, verticalText = _a.verticalText, wrapText = _a.wrapText;
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
export default alignment;
