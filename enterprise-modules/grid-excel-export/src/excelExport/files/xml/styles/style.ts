import { XmlElement } from '@ag-community/grid-core';
import { ExcelStyle, ExcelXMLTemplate } from '@ag-community/grid-core';

const style: ExcelXMLTemplate = {
    getTemplate(styleProperties: ExcelStyle): XmlElement {
        const {id, name} = styleProperties;
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
