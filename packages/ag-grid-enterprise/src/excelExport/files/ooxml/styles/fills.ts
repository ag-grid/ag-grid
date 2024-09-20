import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import type { Fill } from '../../../assets/excelInterfaces';
import fillFactory from './fill';

const fillsFactory: ExcelOOXMLTemplate = {
    getTemplate(fills: Fill[]) {
        return {
            name: 'fills',
            properties: {
                rawMap: {
                    count: fills.length,
                },
            },
            children: fills.map((fill) => fillFactory.getTemplate(fill)),
        };
    },
};

export default fillsFactory;
