import { ToolPanelColumnCompParams, Component } from "@ag-grid-community/core";
export declare enum ExpandState {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export declare class PrimaryColsHeaderPanel extends Component {
    private readonly columnModel;
    private readonly eExpand;
    private readonly eSelect;
    private eFilterTextField;
    private static DEBOUNCE_DELAY;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private expandState;
    private selectState?;
    private onFilterTextChangedDebounced;
    private params;
    private static TEMPLATE;
    constructor();
    protected postConstruct(): void;
    init(params: ToolPanelColumnCompParams): void;
    private createExpandIcons;
    private showOrHideOptions;
    private onFilterTextChanged;
    private onMiniFilterKeyPress;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: ExpandState): void;
    setSelectionState(state?: boolean): void;
}
