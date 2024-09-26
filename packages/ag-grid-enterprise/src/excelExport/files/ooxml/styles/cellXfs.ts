import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import type { Xf } from './xf';
import xfFactory from './xf';

const cellXfsFactory: ExcelOOXMLTemplate = {
    getTemplate(xfs: Xf[]) {
        return {
            name: 'cellXfs',
            properties: {
                rawMap: {
                    count: xfs.length,
                },
            },
            children: xfs.map((xf) => xfFactory.getTemplate(xf)),
        };
    },
};

export default cellXfsFactory;
