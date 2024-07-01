import type { BeanCollection, ComponentSelector } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
import type { ToolPanelFiltersCompParams } from './filtersToolPanel';
export declare enum EXPAND_STATE {
    EXPANDED = 0,
    COLLAPSED = 1,
    INDETERMINATE = 2
}
export type AgFiltersToolPanelHeaderEvent = 'collapseAll' | 'expandAll' | 'searchChanged';
export declare class AgFiltersToolPanelHeader extends Component<AgFiltersToolPanelHeaderEvent> {
    private columnModel;
    wireBeans(beans: BeanCollection): void;
    private readonly eExpand;
    private readonly eFilterTextField;
    private eExpandChecked;
    private eExpandUnchecked;
    private eExpandIndeterminate;
    private onSearchTextChangedDebounced;
    private currentExpandState;
    private params;
    postConstruct(): void;
    init(params: ToolPanelFiltersCompParams): void;
    private createExpandIcons;
    private showOrHideOptions;
    private onSearchTextChanged;
    private onExpandClicked;
    setExpandState(state: EXPAND_STATE): void;
}
export declare const AgFiltersToolPanelHeaderSelector: ComponentSelector;
