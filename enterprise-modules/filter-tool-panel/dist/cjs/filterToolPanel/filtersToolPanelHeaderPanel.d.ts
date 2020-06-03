import { Component } from "@ag-grid-community/core";
import { ToolPanelFiltersCompParams } from "./filtersToolPanel";
export declare enum EXPAND_STATE {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export declare class FiltersToolPanelHeaderPanel extends Component {
    private gridOptionsWrapper;
    private columnController;
    private eExpand;
    private eSearchTextField;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private onSearchTextChangedDebounced;
    private currentExpandState;
    private params;
    private preConstruct;
    postConstruct(): void;
    init(params: ToolPanelFiltersCompParams): void;
    private createExpandIcons;
    private showOrHideOptions;
    private onSearchTextChanged;
    private onExpandClicked;
    setExpandState(state: EXPAND_STATE): void;
}
