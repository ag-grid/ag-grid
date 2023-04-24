import { XmlElement } from '@ag-grid-community/core';
import { ExcelStyle, ExcelXMLTemplate } from '@ag-grid-community/core';

const numberFormat: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const { format } = styleProperties.numberFormat!;
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
