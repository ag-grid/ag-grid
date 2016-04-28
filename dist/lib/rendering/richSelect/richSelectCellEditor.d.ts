// ag-grid-enterprise v4.1.4
import { ICellEditor, ICellEditorParams, Component, Context, ICellRenderer, ICellRendererFunc, CellRendererService } from "ag-grid/main";
export interface IRichCellEditorParams extends ICellEditorParams {
    values: string[];
    cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string;
}
export declare class RichSelectCellEditor extends Component implements ICellEditor {
    private static TEMPLATE;
    context: Context;
    cellRendererService: CellRendererService;
    private params;
    private virtualList;
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
