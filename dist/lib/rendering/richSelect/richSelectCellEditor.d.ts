// ag-grid-enterprise v13.2.0
import { ICellEditor, ICellEditorParams, Component, Context, ICellRendererComp, ICellRendererFunc, CellRendererService } from "ag-grid/main";
export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellHeight: number;
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
