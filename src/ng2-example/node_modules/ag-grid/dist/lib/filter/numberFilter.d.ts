// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IFilter, IFilterParams, IDoesFilterPassParams } from "../interfaces/iFilter";
export declare class NumberFilter implements IFilter {
    static EQUALS: string;
    static NOT_EQUAL: string;
    static LESS_THAN: string;
    static LESS_THAN_OR_EQUAL: string;
    static GREATER_THAN: string;
    static GREATER_THAN_OR_EQUAL: string;
    private filterParams;
    private gridOptionsWrapper;
    private filterNumber;
    private filterType;
    private applyActive;
    private newRowsActionKeep;
    private eGui;
    private eFilterTextField;
    private eTypeSelect;
    private eApplyButton;
    init(params: IFilterParams): void;
    onNewRowsLoaded(): void;
    afterGuiAttached(): void;
    doesFilterPass(params: IDoesFilterPassParams): boolean;
    getGui(): HTMLElement;
    isFilterActive(): boolean;
    private createTemplate();
    private createGui();
    private setupApply();
    private onTypeChanged();
    private filterChanged();
    private onFilterChanged();
    setType(type: string): void;
    setFilter(filter: any): void;
    getFilter(): any;
    getModel(): any;
    setModel(model: any): void;
}
