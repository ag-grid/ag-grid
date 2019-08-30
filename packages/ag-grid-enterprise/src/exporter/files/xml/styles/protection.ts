import { XmlElement } from 'ag-grid-community';
import { ExcelStyle, ExcelXMLTemplate } from 'ag-grid-community';

const protection: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        Protected: styleProperties.protection.protected,
                        HideFormula: styleProperties.protection.hideFormula
                    }
                }]
            }
        };
    }
};

export default protection;
