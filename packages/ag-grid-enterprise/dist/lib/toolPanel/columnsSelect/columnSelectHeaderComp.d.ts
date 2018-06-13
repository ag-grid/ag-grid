// ag-grid-enterprise v18.0.1
import { Component } from "ag-grid/main";
export declare enum SELECTED_STATE {
    CHECKED = 0,
    UNCHECKED = 1,
    INDETERMINIATE = 2,
}
export declare class ColumnSelectHeaderComp extends Component {
    private context;
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
    private eFilter;
    private onFilterTextChangedDebounced;
    private expandState;
    private selectState;
    private preConstruct();
    init(): void;
    private showOrHideOptions();
    private addEventListeners();
    private onFilterTextChanged();
    private onSelectClicked();
    private onExpandClicked();
    setExpandState(state: SELECTED_STATE): void;
    private setColumnsCheckedState();
}
