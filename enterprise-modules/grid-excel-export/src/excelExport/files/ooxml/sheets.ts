import { ExcelOOXMLTemplate } from '@ag-grid-community/grid-core';
import sheetFactory from './sheet';

const sheetsFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[]) {
        return {
            name: "sheets",
            children: names.map(sheetFactory.getTemplate)
        };
    }
};

export default sheetsFactory;
