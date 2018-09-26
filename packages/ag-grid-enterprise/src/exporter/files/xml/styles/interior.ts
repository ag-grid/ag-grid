import {XmlElement} from 'ag-grid-community';
import {ExcelStyle, ExcelXMLTemplate} from 'ag-grid-community';

const interior: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const {color, pattern, patternColor} = styleProperties.interior;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes:[{
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