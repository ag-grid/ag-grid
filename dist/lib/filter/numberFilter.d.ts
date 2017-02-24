// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { IFilterParams, IDoesFilterPassParams, IFilterComp } from "../interfaces/iFilter";
import { Component } from "../widgets/component";
export declare class NumberFilter extends Component implements IFilterComp {
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN: string;
    static LESS_THAN_OR_EQUAL: string;
    static GREATER_THAN: string;
    static GREATER_THAN_OR_EQUAL: string;
    static IN_RANGE: string;
    private filterParams;
    private context;
    private gridOptionsWrapper;
    private eNumberToPanel;
    private filterNumber;
    private filterNumberTo;
    private filterType;
    private applyActive;
    private newRowsActionKeep;
    private eFilterToTextField;
    private eFilterTextField;
    private eTypeSelect;
    private eApplyButton;
    init(params: IFilterParams): void;
    onNewRowsLoaded(): void;
    afterGuiAttached(): void;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    isFilterActive(): boolean;
    private createTemplate();
    private createGui();
    private setupApply();
    private onTypeChanged();
    private filterChanged();
    private onFilterChanged();
    private stringToFloat(value);
    setType(type: string): void;
    setFilter(filter: any): void;
    setFilterTo(filter: any): void;
    getFilter(): any;
    getModel(): any;
    setModel(model: any): void;
    private setVisibilityOnDateToPanel();
}
