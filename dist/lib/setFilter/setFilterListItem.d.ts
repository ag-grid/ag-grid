// ag-grid-enterprise v8.0.0
import { Component, ICellRendererFunc, ICellRendererComp } from "ag-grid/main";
export declare class SetFilterListItem extends Component {
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private cellRendererService;
    private static TEMPLATE;
    private eCheckbox;
    private value;
    private cellRenderer;
    constructor(value: any, cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string);
    private init();
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    render(): void;
}
