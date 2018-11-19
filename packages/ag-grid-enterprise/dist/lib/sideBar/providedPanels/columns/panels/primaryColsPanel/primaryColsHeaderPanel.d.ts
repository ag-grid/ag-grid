// ag-grid-enterprise v19.1.3
import { Component } from "ag-grid-community/main";
import { ToolPanelColumnCompParams } from "../../columnToolPanel";
export declare enum SELECTED_STATE {
    CHECKED = 0,
    UNCHECKED = 1,
    INDETERMINIATE = 2
}
export declare class PrimaryColsHeaderPanel extends Component {
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
    private eFilterWrapper;
    private onFilterTextChangedDebounced;
    private expandState;
    private selectState;
    private props;
    private preConstruct;
    init(params: ToolPanelColumnCompParams): void;
    private showOrHideOptions;
    private addEventListeners;
    private onFilterTextChanged;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: SELECTED_STATE): void;
    private setColumnsCheckedState;
}
//# sourceMappingURL=primaryColsHeaderPanel.d.ts.map