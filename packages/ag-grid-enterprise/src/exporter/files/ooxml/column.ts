import {ExcelOOXMLTemplate, ExcelColumn} from 'ag-grid-community';

const getExcelCellWidth = (width: number): number => Math.max(Math.ceil((width - 12) / 7 + 1), 10);

const columnFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelColumn) {
        const {min, max, s, width = 10, hidden, bestFit} = config;
        const excelWidth = getExcelCellWidth(width);

        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: excelWidth != 10 ? '1' : '0'
                }
            }
        };
    }
};

export default columnFactory;