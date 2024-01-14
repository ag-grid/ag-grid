// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { LocaleService } from "../../localeService";
import { GridOptionsService } from "../../gridOptionsService";
export declare class PageSizeSelectorComp extends Component {
    protected readonly localeService: LocaleService;
    protected readonly gridOptionsService: GridOptionsService;
    private paginationProxy;
    private selectPageSizeComp;
    private hasEmptyOption;
    constructor();
    private init;
    private handlePageSizeItemSelected;
    private handlePaginationChanged;
    toggleSelectDisplay(show: boolean): void;
    private reset;
    private onPageSizeSelectorValuesChange;
    shouldShowPageSizeSelector(): boolean;
    private reloadPageSizesSelector;
    private getPageSizeSelectorValues;
    private validateValues;
    destroy(): void;
}
