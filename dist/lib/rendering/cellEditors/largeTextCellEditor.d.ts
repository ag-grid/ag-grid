// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { ICellEditorComp } from "./iCellEditor";
import { ICellEditorParams } from "./iCellEditor";
import { Component } from "../../widgets/component";
import { ICellRenderer } from "../cellRenderers/iCellRenderer";
import { ICellRendererFunc } from "../cellRenderers/iCellRenderer";
export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
    cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
}
export declare class LargeTextCellEditor extends Component implements ICellEditorComp {
    private static TEMPLATE;
    private params;
    private textarea;
    private focusAfterAttached;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown(event);
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
}
