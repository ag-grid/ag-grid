import { ExcelStyle, ExcelXMLTemplate, XmlElement } from '@ag-grid-community/core';

const style: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const { id, name } = styleProperties;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes:[{
                    prefix: "ss:",
                    map: {
                        ID: id,
                        Name: name ?  name : id
                    }
                }]
            }
        };
    }
};

export default style;
