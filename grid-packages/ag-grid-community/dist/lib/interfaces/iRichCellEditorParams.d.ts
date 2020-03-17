import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ICellEditorParams } from "./iCellEditor";
declare type CellValue = object | string | number;
export interface IRichCellEditorParams extends ICellEditorParams {
    values: CellValue[];
    cellHeight: number;
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
}
export {};
