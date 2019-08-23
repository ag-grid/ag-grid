import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
import fillFactory, { Fill } from './fill';

const fillsFactory: ExcelOOXMLTemplate = {
    getTemplate(fills: Fill[]) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: _.map(fills, fillFactory.getTemplate)
        };
    }
};

export default fillsFactory;
