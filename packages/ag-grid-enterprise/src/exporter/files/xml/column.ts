import { XmlElement } from 'ag-grid-community';
import { ExcelColumn, ExcelXMLTemplate } from 'ag-grid-community';

const column: ExcelXMLTemplate = {
    getTemplate(c: ExcelColumn): XmlElement {
        const {width} = c;
        return {
            name:"Column",
            properties:{
                prefixedAttributes: [{
                    prefix:"ss:",
                    map: {
                        Width: width
                    }
                }]
            }
        };
    }
};

export default column;
