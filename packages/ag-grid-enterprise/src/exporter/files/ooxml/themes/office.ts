import {ExcelOOXMLTemplate} from 'ag-grid-community';
import themeElements from './office/themeElements';

const officeTheme: ExcelOOXMLTemplate = {
    getTemplate() {

        return {
            name: "a:theme",
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        a: "http://schemas.openxmlformats.org/drawingml/2006/main"
                    },
                }],
                rawMap: {
                    name: "Office Theme"
                }
            },
            children: [
                themeElements.getTemplate(),
                {
                    name: 'a:objectDefaults'
                },
                {
                    name: 'a:extraClrSchemeLst'
                }
            ]
        };
    }
};

export default officeTheme;