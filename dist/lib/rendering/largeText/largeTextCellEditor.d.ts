// ag-grid-enterprise v4.2.8
import { ICellEditor, ICellEditorParams, Component, ICellRenderer, ICellRendererFunc } from "ag-grid/main";
export interface ILargeTextEditorParams extends ICellEditorParams {
    maxLength: number;
    rows: number;
    cols: number;
    cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
}
export declare class LargeTextCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    private params;
    private textarea;
    constructor();
    init(params: ILargeTextEditorParams): void;
    private onKeyDown(event);
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
}
