// ag-grid-enterprise v12.0.2
import { Component, ICellRendererFunc, ICellRendererComp, Column } from "ag-grid/main";
export declare class SetFilterListItem extends Component {
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private cellRendererService;
    private static TEMPLATE;
    private eCheckbox;
    private eClickableArea;
    private selected;
    private value;
    private column;
    private cellRenderer;
    private eCheckedIcon;
    private eUncheckedIcon;
    constructor(value: any, cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string, column: Column);
    private init();
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    private updateCheckboxIcon();
    render(): void;
}
