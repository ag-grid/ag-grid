// ag-grid-enterprise v8.0.0
import { ICellEditor, ICellEditorParams, Component, Context, ICellRendererComp, ICellRendererFunc, CellRendererService } from "ag-grid/main";
export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
}
export declare class RichSelectCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    context: Context;
    cellRendererService: CellRendererService;
    private params;
    private virtualList;
    private focusAfterAttached;
    private selectedValue;
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
