import { ExcelOOXMLTemplate } from '@ag-grid-community/grid-core';
declare const borderFactory: ExcelOOXMLTemplate;
export default borderFactory;
export interface CellStyle {
    builtinId: number;
    name: string;
    xfId: number;
}
