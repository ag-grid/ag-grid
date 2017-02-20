// ag-grid-enterprise v8.1.0
import { IFilterComp, IFilterParams, IDoesFilterPassParams, ICellRendererComp, ICellRendererFunc, Component } from "ag-grid/main";
export interface ISetFilterParams extends IFilterParams {
    suppressRemoveEntries?: boolean;
    values?: any;
    cellHeight: number;
    apply: boolean;
    suppressSorting: boolean;
    cellRenderer: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    newRowsAction: string;
    suppressMiniFilter: boolean;
    selectAllOnMiniFilter: boolean;
    comparator?: (a: any, b: any) => number;
}
export declare class SetFilter extends Component implements IFilterComp {
    private gridOptionsWrapper;
    private context;
    private params;
    private model;
    private suppressSorting;
    private applyActive;
    private newRowsActionKeep;
    private eSelectAll;
    private eMiniFilter;
    private eApplyButton;
    private virtualList;
    constructor();
    private postConstruct();
    init(params: IFilterParams): void;
    private createSetListItem(value);
    afterGuiAttached(params: any): void;
    isFilterActive(): boolean;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    onNewRowsLoaded(): void;
    onAnyFilterChanged(): void;
    private createTemplate();
    private createGui();
    private updateSelectAll();
    private setupApply();
    private filterChanged();
    private onMiniFilterChanged();
    private onSelectAll();
    private onItemSelected(value, selected);
    setMiniFilter(newMiniFilter: any): void;
    getMiniFilter(): any;
    selectEverything(): void;
    selectNothing(): void;
    unselectValue(value: any): void;
    selectValue(value: any): void;
    isValueSelected(value: any): boolean;
    isEverythingSelected(): boolean;
    isNothingSelected(): boolean;
    getUniqueValueCount(): number;
    getUniqueValue(index: any): any;
    getModel(): any;
    setModel(dataModel: any): void;
}
