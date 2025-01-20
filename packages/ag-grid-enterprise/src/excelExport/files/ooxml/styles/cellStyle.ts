import type { ExcelOOXMLTemplate } from 'ag-grid-community';

const borderFactory: ExcelOOXMLTemplate = {
    getTemplate(cellStyle: ExcelCellStyle) {
        const { builtinId, name, xfId } = cellStyle;

        return {
            name: 'cellStyle',
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId,
                },
            },
        };
    },
};

export default borderFactory;

export interface ExcelCellStyle {
    builtinId: number;
    name: string;
    xfId: number;
}
