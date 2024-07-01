import type { BeanCollection, ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ToolPanelColumnCompParams } from './columnToolPanel';
export declare enum ExpandState {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export type AgPrimaryColsHeaderEvent = 'unselectAll' | 'selectAll' | 'collapseAll' | 'expandAll' | 'filterChanged';
export declare class AgPrimaryColsHeader extends Component<AgPrimaryColsHeaderEvent> {
    private columnModel;
    wireBeans(beans: BeanCollection): void;
    private readonly eExpand;
    private readonly eSelect;
    private readonly eFilterTextField;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private expandState;
    private selectState?;
    private onFilterTextChangedDebounced;
    private params;
    constructor();
    postConstruct(): void;
    private onFunctionsReadOnlyPropChanged;
    init(params: ToolPanelColumnCompParams): void;
    private createExpandIcons;
    private showOrHideOptions;
    private onFilterTextChanged;
    private onMiniFilterKeyDown;
    private onSelectClicked;
    private onExpandClicked;
    setExpandState(state: ExpandState): void;
    setSelectionState(state?: boolean): void;
}
export declare const AgPrimaryColsHeaderSelector: ComponentSelector;
