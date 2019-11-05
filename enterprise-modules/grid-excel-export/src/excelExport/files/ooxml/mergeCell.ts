import { ExcelOOXMLTemplate } from '@ag-grid-community/core';

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
