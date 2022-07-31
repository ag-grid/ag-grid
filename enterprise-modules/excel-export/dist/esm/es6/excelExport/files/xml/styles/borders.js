const borders = {
    getTemplate(styleProperties) {
        const { borderBottom, borderLeft, borderRight, borderTop } = styleProperties.borders;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map((it, index) => {
                const current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
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
