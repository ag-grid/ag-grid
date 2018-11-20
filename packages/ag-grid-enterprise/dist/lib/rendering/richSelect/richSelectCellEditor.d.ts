// ag-grid-enterprise v19.1.3
import { ICellEditor, Component, Context, CellRendererService, IRichCellEditorParams } from "ag-grid-community";
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
    isPopup(): boolean;
}
//# sourceMappingURL=richSelectCellEditor.d.ts.map