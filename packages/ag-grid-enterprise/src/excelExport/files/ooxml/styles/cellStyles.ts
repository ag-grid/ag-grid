import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import type { ExcelCellStyle } from './cellStyle';
import cellStyleFactory from './cellStyle';

const cellStylesFactory: ExcelOOXMLTemplate = {
    getTemplate(cellStyles: ExcelCellStyle[]) {
        return {
            name: 'cellStyles',
            properties: {
                rawMap: {
                    count: cellStyles.length,
                },
            },
            children: cellStyles.map((cellStyle) => cellStyleFactory.getTemplate(cellStyle)),
        };
    },
};

export default cellStylesFactory;
