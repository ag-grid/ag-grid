import type { ExcelOOXMLTemplate } from '@ag-grid-community/core';

import type { Xf } from './xf';
import xfFactory from './xf';

const cellStylesXfsFactory: ExcelOOXMLTemplate = {
    getTemplate(xfs: Xf[]) {
        return {
            name: 'cellStyleXfs',
            properties: {
                rawMap: {
                    count: xfs.length,
                },
            },
            children: xfs.map((xf) => xfFactory.getTemplate(xf)),
        };
    },
};

export default cellStylesXfsFactory;
