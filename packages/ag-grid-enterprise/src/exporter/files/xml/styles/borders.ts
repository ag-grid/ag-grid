import { XmlElement } from 'ag-grid-community';
import { ExcelBorder, ExcelStyle, ExcelXMLTemplate } from 'ag-grid-community';

const borders: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const {
            borderBottom,
            borderLeft,
            borderRight,
            borderTop
        } = styleProperties.borders;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map((it: ExcelBorder, index: number) => {
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
