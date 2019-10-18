import { XmlElement } from '@ag-community/grid-core';
import { ExcelXMLTemplate } from '@ag-community/grid-core';

const documentProperties: ExcelXMLTemplate = {
    getTemplate(): XmlElement {
        return {
            name: "DocumentProperties",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:office"
                }
            },
            children: [{
                name: "Version",
                textNode: "12.00"
            }]
        };
    }
};

export default documentProperties;
