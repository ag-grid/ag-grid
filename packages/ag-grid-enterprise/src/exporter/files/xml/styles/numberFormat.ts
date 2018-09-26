import {XmlElement} from 'ag-grid-community';
import {ExcelStyle, ExcelXMLTemplate} from 'ag-grid-community';

const numberFormat: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const {format} = styleProperties.numberFormat;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Format: format
                    }
                }]
            }
        };
    }
};

export default numberFormat;