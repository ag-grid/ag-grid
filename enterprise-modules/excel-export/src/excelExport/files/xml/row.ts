import { XmlElement } from '@ag-community/grid-core';
import { ExcelRow, ExcelXMLTemplate } from '@ag-community/grid-core';
import cell from './cell';

const row: ExcelXMLTemplate = {
    getTemplate(r: ExcelRow): XmlElement {
        const { cells } = r;

        return {
            name: "Row",
            children: cells.map(it => cell.getTemplate(it))
        };
    }
};

export default row;
