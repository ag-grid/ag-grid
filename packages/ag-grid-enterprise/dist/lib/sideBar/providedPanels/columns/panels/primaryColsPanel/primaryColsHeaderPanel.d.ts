// ag-grid-enterprise v21.2.2
import { Component } from "ag-grid-community/main";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";
export declare enum SELECTED_STATE {
    CHECKED = 0,
    UNCHECKED = 1,
    INDETERMINATE = 2
}
export declare class PrimaryColsHeaderPanel extends Component {
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private eFilterTextField;
    private eSelectChecked;
    private eSelectUnchecked;
    private eSelectIndeterminate;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private eExpand;
    private eSelect;
    private eFilterWrapper;
    private onFilterTextChangedDebounced;
    private expandState;
    private selectState;
    private params;
    private preConstruct;
    postConstruct(): void;
    init(params: ToolPanelColumnCompParams): void;
    private createExpandIcons;
    private createCheckIcons;
    private showOrHideOptions;
    private addEventListeners;
    private onFilterTextChanged;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: SELECTED_STATE): void;
    private setColumnsCheckedState;
}
