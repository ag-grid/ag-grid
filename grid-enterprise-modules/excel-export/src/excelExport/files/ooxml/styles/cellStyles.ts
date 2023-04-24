import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
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
            children: cellStyles.map(cellStyle => cellStyleFactory.getTemplate(cellStyle))
        };
    }
};

export default cellStylesFactory;
