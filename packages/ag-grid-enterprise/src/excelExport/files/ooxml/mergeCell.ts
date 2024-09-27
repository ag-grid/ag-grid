import type { ExcelOOXMLTemplate } from 'ag-grid-community';

const mergeCellFactory: ExcelOOXMLTemplate = {
    getTemplate(ref: string) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref,
                },
            },
        };
    },
};

export default mergeCellFactory;
