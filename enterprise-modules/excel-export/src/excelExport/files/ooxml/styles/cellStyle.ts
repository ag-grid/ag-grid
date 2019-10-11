import { ExcelOOXMLTemplate } from 'ag-grid-community';

const borderFactory: ExcelOOXMLTemplate = {
    getTemplate(cellStyle: CellStyle) {
        const {builtinId, name, xfId} = cellStyle;

        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId,
                    name,
                    xfId
                }
            }
        };
    }
};

export default borderFactory;

export interface CellStyle {
    builtinId: number;
    name: string;
    xfId: number;
}
