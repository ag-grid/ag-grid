import { XmlElement } from 'ag-grid-community';
import { ExcelXMLTemplate } from 'ag-grid-community';

const workbook: ExcelXMLTemplate = {
    getTemplate(): XmlElement {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        o: "urn:schemas-microsoft-com:office:office",
                        x: "urn:schemas-microsoft-com:office:excel",
                        ss: "urn:schemas-microsoft-com:office:spreadsheet",
                        html: "http://www.w3.org/TR/REC-html40"
                    },
                }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            }
        };
    }
};

export default workbook;
