import { ExcelOOXMLTemplate } from '@ag-grid-community/grid-core';
import cellStyleFactory, { CellStyle } from './cellStyle';

const cellStylesFactory: ExcelOOXMLTemplate = {
    getTemplate(cellStyles: CellStyle[]) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(cellStyleFactory.getTemplate)
        };
    }
};

export default cellStylesFactory;
