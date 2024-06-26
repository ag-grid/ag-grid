import type { BeanCollection } from '../../context/context';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
export declare class PageSizeSelectorComp extends Component {
    private paginationService;
    wireBeans(beans: BeanCollection): void;
    private selectPageSizeComp;
    private hasEmptyOption;
    constructor();
    postConstruct(): void;
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
export declare const PageSizeSelectorSelector: ComponentSelector;
