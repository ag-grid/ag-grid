// ag-grid-enterprise v4.1.4
import { Component, ICellRenderer, ICellRendererFunc } from "ag-grid/main";
export declare class SetFilterListItem extends Component {
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private cellRendererService;
    private static TEMPLATE;
    private eCheckbox;
    private value;
    private cellRenderer;
    constructor(value: any, cellRenderer: {
        new (): ICellRenderer;
    } | ICellRendererFunc | string);
    private init();
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    render(): void;
}
