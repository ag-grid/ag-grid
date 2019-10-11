import { ExcelOOXMLTemplate } from 'ag-grid-community';

const mergeCell: ExcelOOXMLTemplate = {
    getTemplate(ref: string) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};

export default mergeCell;
