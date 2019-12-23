import { Component, ToolPanelColumnCompParams } from "@ag-grid-community/core";
export declare enum EXPAND_STATE {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export declare enum SELECTED_STATE {
    CHECKED = 0,
    UNCHECKED = 1,
    INDETERMINATE = 2
}
export declare class PrimaryColsHeaderPanel extends Component {
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private eExpand;
    private eSelect;
    private eFilterWrapper;
    private eFilterTextField;
    private eSelectChecked;
    private eSelectUnchecked;
    private eSelectIndeterminate;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private eSelectCheckbox;
    private expandState;
    private selectState;
    private onFilterTextChangedDebounced;
    private params;
    private preConstruct;
    postConstruct(): void;
    init(params: ToolPanelColumnCompParams): void;
    private createExpandIcons;
    private createCheckIcons;
    private showOrHideOptions;
    private onFilterTextChanged;
    private onMiniFilterKeyPress;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: EXPAND_STATE): void;
    setSelectionState(state: SELECTED_STATE): void;
}
