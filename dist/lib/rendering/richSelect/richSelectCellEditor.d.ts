// ag-grid-enterprise v14.1.0
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
    private cellRenderer;
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
