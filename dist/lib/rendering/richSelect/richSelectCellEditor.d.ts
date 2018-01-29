// ag-grid-enterprise v16.0.1
import { ICellEditor, Component, Context, CellRendererService, IRichCellEditorParams } from "ag-grid/main";
export declare class RichSelectCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    context: Context;
    cellRendererService: CellRendererService;
    private params;
    private virtualList;
    private focusAfterAttached;
    private selectedValue;
    private originalSelectedValue;
    private selectionConfirmed;
    constructor();
    init(params: IRichCellEditorParams): void;
    private onKeyDown(event);
    private onEnterKeyDown();
    private onNavigationKeyPressed(event, key);
    private renderSelectedValue();
    private setSelectedValue(value);
    private createRowComponent(value);
    private onMouseMove(mouseEvent);
    private onClick();
    afterGuiAttached(): void;
    getValue(): any;
    isPopup(): boolean;
}
