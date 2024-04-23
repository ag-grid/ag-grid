import { Component } from "../../widgets/component";
export declare class PageSizeSelectorComp extends Component {
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
