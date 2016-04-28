// ag-grid-enterprise v4.1.4
import { Component } from "ag-grid/main";
import { Filter } from "ag-grid/main";
export declare class SetFilter extends Component implements Filter {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private context;
    private filterParams;
    private model;
    private filterChangedCallback;
    private filterModifiedCallback;
    private valueGetter;
    private colDef;
    private eSelectAll;
    private eMiniFilter;
    private api;
    private applyActive;
    private eApplyButton;
    private virtualList;
    constructor();
    private postConstruct();
    init(params: any): void;
    private createSetListItem(value);
    afterGuiAttached(params: any): void;
    getApi(): any;
    isFilterActive(): boolean;
    doesFilterPass(node: any): boolean;
    onNewRowsLoaded(): void;
    onAnyFilterChanged(): void;
    private createTemplate();
    private createGui();
    private setupApply();
    private filterChanged();
    private onMiniFilterChanged();
    private onSelectAll();
    private onItemSelected(value, selected);
    private createApi();
}
