import { AgEvent, Column, Component } from "@ag-grid-community/core";
export interface SelectedEvent extends AgEvent {
}
export declare class SetFilterListItem extends Component {
    static EVENT_SELECTED: string;
    private gridOptionsWrapper;
    private valueFormatterService;
    private userComponentFactory;
    private static TEMPLATE;
    private eCheckbox;
    private eNativeCheckbox;
    private eClickableArea;
    private selected;
    private value;
    private column;
    private eCheckedIcon;
    private eUncheckedIcon;
    constructor(value: any, column: Column);
    private useCellRenderer;
    private init;
    isSelected(): boolean;
    setSelected(selected: boolean): void;
    private updateCheckboxIcon;
    render(): void;
}
