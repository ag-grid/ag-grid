// ag-grid-enterprise v20.2.0
import { ICellEditor, IRichCellEditorParams, PopupComponent } from "ag-grid-community";
export declare class RichSelectCellEditor extends PopupComponent implements ICellEditor {
    private static TEMPLATE;
    private userComponentFactory;
    private gridOptionsWrapper;
    private params;
    private virtualList;
    private focusAfterAttached;
    private selectedValue;
    private originalSelectedValue;
    private selectionConfirmed;
    constructor();
    init(params: IRichCellEditorParams): void;
    private onKeyDown;
    private onEnterKeyDown;
    private onNavigationKeyPressed;
    private renderSelectedValue;
    private setSelectedValue;
    private createRowComponent;
    private onMouseMove;
    private onClick;
    afterGuiAttached(): void;
    getValue(): any;
}
