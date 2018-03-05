import {ICellRendererComp, ICellRendererFunc} from "../rendering/cellRenderers/iCellRenderer";
import {ICellEditorParams} from "../rendering/cellEditors/iCellEditor";

export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellHeight: number;
    cellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
}