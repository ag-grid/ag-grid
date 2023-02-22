import { XmlElement } from '@ag-grid-community/core';
import { ExcelStyle, ExcelXMLTemplate } from '@ag-grid-community/core';

const protection: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Protected: styleProperties.protection!.protected,
                        HideFormula: styleProperties.protection!.hideFormula
                    }
                }]
            }
        };
    }
};

export default protection;
