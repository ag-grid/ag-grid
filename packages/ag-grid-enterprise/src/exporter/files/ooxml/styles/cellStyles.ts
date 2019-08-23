import { ExcelOOXMLTemplate, _ } from 'ag-grid-community';
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
            children: _.map(cellStyles, cellStyleFactory.getTemplate)
        };
    }
};

export default cellStylesFactory;
