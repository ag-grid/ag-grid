import { ToolPanelColumnCompParams, ManagedFocusComponent } from "@ag-grid-community/core";
export declare enum EXPAND_STATE {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export declare class PrimaryColsHeaderPanel extends ManagedFocusComponent {
    private gridOptionsWrapper;
    private columnController;
    private eExpand;
    private eSelect;
    private eFilterTextField;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private expandState;
    private selectState;
    private onFilterTextChangedDebounced;
    private params;
    private preConstruct;
    protected postConstruct(): void;
    init(params: ToolPanelColumnCompParams): void;
    protected onTabKeyDown(e: KeyboardEvent): void;
    private createExpandIcons;
    private showOrHideOptions;
    private onFilterTextChanged;
    private onMiniFilterKeyPress;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: EXPAND_STATE): void;
    setSelectionState(state?: boolean): void;
}
