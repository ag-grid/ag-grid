// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { Filter } from "./filter";
export declare class TextFilter implements Filter {
    private filterParams;
    private filterChangedCallback;
    private filterModifiedCallback;
    private localeTextFunc;
    private valueGetter;
    private filterText;
    private filterType;
    private api;
    private eGui;
    private eFilterTextField;
    private eTypeSelect;
    private applyActive;
    private eApplyButton;
    init(params: any): void;
    onNewRowsLoaded(): void;
    afterGuiAttached(): void;
    doesFilterPass(node: any): boolean;
    getGui(): any;
    isFilterActive(): boolean;
    private createTemplate();
    private createGui();
    private setupApply();
    private onTypeChanged();
    private onFilterChanged();
    private filterChanged();
    private createApi();
    getApi(): any;
}
