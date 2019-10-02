import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
import { ICellEditorParams } from "./iCellEditor";

export interface IRichCellEditorParams extends ICellEditorParams {
    values: unknown[];
    cellHeight: number;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
}