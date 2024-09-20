import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import sheetFactory from './sheet';

const sheetsFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[]) {
        return {
            name: 'sheets',
            children: names.map((sheet, idx) => sheetFactory.getTemplate(sheet, idx)),
        };
    },
};

export default sheetsFactory;
