import { XmlElement } from '@ag-community/grid-core';
import { ExcelStyle, ExcelXMLTemplate } from '@ag-community/grid-core';

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
