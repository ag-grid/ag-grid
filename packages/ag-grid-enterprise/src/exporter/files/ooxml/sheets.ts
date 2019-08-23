import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
import sheetFactory from './sheet';

const sheetsFactory: ExcelOOXMLTemplate = {
    getTemplate(names: string[]) {
        return {
            name: "sheets",
            children: _.map(names, sheetFactory.getTemplate)
        };
    }
};

export default sheetsFactory;
