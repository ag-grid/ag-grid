import { XmlElement } from '@ag-community/grid-core';
import { ExcelColumn, ExcelXMLTemplate } from '@ag-community/grid-core';

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
