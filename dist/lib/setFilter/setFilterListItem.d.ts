// ag-grid-enterprise v16.0.1
import { Component, Column, AgEvent } from "ag-grid/main";
export interface SelectedEvent extends AgEvent {
}
export declare class SetFilterListItem extends Component {
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private cellRendererService;
    private valueFormatterService;
    private static TEMPLATE;
    private eCheckbox;
    private eClickableArea;
    private selected;
    private value;
    private column;
    private eCheckedIcon;
    private eUncheckedIcon;
    constructor(value: any, column: Column);
    private init();
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    private updateCheckboxIcon();
    render(): void;
}
