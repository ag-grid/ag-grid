import { ExcelOOXMLTemplate } from 'ag-grid-community';
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
            children: fills.map(fillFactory.getTemplate)
        };
    }
};

export default fillsFactory;
