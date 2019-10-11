import { ExcelOOXMLTemplate } from 'ag-grid-community';
import sheetsFactory from './sheets';

const workbookFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[]) {

        return {
            name: "workbook",
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    },
                }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: [sheetsFactory.getTemplate(names)]
        };
    }
};

export default workbookFactory;
