var borders = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.borders, borderBottom = _a.borderBottom, borderLeft = _a.borderLeft, borderRight = _a.borderRight, borderTop = _a.borderTop;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map(function (it, index) {
                var current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                return {
                    name: 'Border',
                    properties: {
                        prefixedAttributes: [{
                                prefix: 'ss:',
                                map: {
                                    Position: current,
                                    LineStyle: it.lineStyle,
                                    Weight: it.weight,
                                    Color: it.color
                                }
                            }]
                    }
                };
            })
        };
    }
};
export default borders;
