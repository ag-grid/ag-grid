import { ExcelOOXMLTemplate } from 'ag-grid-community';

const sheetFactory: ExcelOOXMLTemplate = {
    getTemplate(name: string, idx: number) {
        const sheetId = (idx + 1).toString();
        return {
            name: "sheet",
            properties: {
                rawMap: {
                    "name": name,
                    "sheetId": sheetId,
                    "r:id": `rId${sheetId}`
                }
            }
        };
    }
};

export default sheetFactory;
