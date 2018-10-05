import {XmlElement} from 'ag-grid-community';
import {ExcelStyle,ExcelXMLTemplate} from 'ag-grid-community';

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