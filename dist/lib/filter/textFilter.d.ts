// Type definitions for ag-grid v6.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { IFilter, IFilterParams, IDoesFilterPassParams } from "../interfaces/iFilter";
export declare class TextFilter implements IFilter {
    static CONTAINS: string;
    static EQUALS: string;
    static NOT_EQUALS: string;
    static STARTS_WITH: string;
    static ENDS_WITH: string;
    private filterParams;
    private gridOptionsWrapper;
    private filterText;
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
    private onFilterChanged();
    private filterChanged();
    setType(type: string): void;
    setFilter(filter: string): void;
    getType(): string;
    getFilter(): string;
    getModel(): any;
    setModel(model: any): void;
}
