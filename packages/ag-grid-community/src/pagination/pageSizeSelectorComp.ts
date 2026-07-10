import { _areEqual, _clearElement } from 'ag-stack';

import type { ListOption } from '../agWidgets/agList';
import { AgSelect } from '../agWidgets/agSelect';
import type { BeanCollection } from '../context/context';
import type { PageSizePanelParams } from '../entities/gridOptions';
import type { PaginationChangedEvent } from '../events';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ElementParams } from '../utils/element';
import { _toFiniteNumber } from '../utils/number';
import { Component } from '../widgets/component';
import type { GridSelect } from '../widgets/gridWidgetTypes';
import type { PaginationService } from './paginationService';

const paginationPageSizeSelector = 'paginationPageSizeSelector';
const PageSizeSelectorCompElement: ElementParams = { tag: 'span', cls: 'ag-paging-page-size' };
export class PageSizeSelectorComp extends Component {
    private pagination: PaginationService;

    public wireBeans(beans: BeanCollection): void {
        this.pagination = beans.pagination!;
    }

    private selectPageSizeComp: GridSelect | undefined;
    private hasEmptyOption = false;
    private pageSizeOptions?: (string | number)[];

    constructor(private readonly panelParams?: PageSizePanelParams) {
        super(PageSizeSelectorCompElement);
    }

    private getPageSizeSelectorOption(): number[] | boolean | undefined {
        return this.panelParams?.paginationPageSizeSelector ?? this.gos.get(paginationPageSizeSelector);
    }

    public postConstruct() {
        this.addManagedPropertyListener(paginationPageSizeSelector, () => {
            this.onPageSizeSelectorValuesChange();
        });

        this.addManagedEventListeners({ paginationChanged: (event) => this.handlePaginationChanged(event) });
    }

    private readonly handlePageSizeItemSelected = (): void => {
        if (!this.selectPageSizeComp) {
            return;
        }

        const newValue = this.selectPageSizeComp.getValue();

        if (!newValue) {
            return;
        }

        const paginationPageSize = _toFiniteNumber(newValue);

        if (
            paginationPageSize == null ||
            paginationPageSize < 1 ||
            paginationPageSize === this.pagination.getPageSize()
        ) {
            return;
        }

        this.pagination.setPageSize(paginationPageSize, 'pageSizeSelector');

        if (this.hasEmptyOption) {
            // Toggle the selector to force a refresh of the options and hide the empty option,
            // as it's no longer needed.
            this.toggleSelectDisplay(true);
        }

        this.selectPageSizeComp.getFocusableElement().focus();
    };

    private handlePaginationChanged(paginationChangedEvent?: WithoutGridCommon<PaginationChangedEvent>): void {
        if (!this.selectPageSizeComp || !paginationChangedEvent?.newPageSize) {
            return;
        }

        const paginationPageSize = this.pagination.getPageSize();
        if (this.getPageSizeSelectorValues().includes(paginationPageSize)) {
            this.selectPageSizeComp.setValue(paginationPageSize.toString());
        } else if (this.hasEmptyOption) {
            this.selectPageSizeComp.setValue('');
        } else {
            this.toggleSelectDisplay(true);
        }
    }

    public toggleSelectDisplay(show: boolean) {
        if (this.selectPageSizeComp && !show) {
            this.reset();
        }

        if (!show) {
            return;
        }

        this.reloadPageSizesSelector();

        if (!this.selectPageSizeComp) {
            return;
        }
    }

    private reset(): void {
        _clearElement(this.getGui());

        if (!this.selectPageSizeComp) {
            return;
        }

        this.selectPageSizeComp = this.destroyBean(this.selectPageSizeComp);
    }

    private onPageSizeSelectorValuesChange(): void {
        if (!this.selectPageSizeComp) {
            return;
        }

        if (this.shouldShowPageSizeSelector()) {
            this.reloadPageSizesSelector();
        }
    }

    public shouldShowPageSizeSelector(): boolean {
        return !this.gos.get('paginationAutoPageSize') && this.getPageSizeSelectorOption() !== false;
    }

    public updateVisibility(): void {
        const show = this.shouldShowPageSizeSelector();
        this.toggleSelectDisplay(show);
        this.setDisplayed(show);
    }

    private reloadPageSizesSelector(): void {
        const pageSizeOptions: (number | string)[] = this.getPageSizeSelectorValues();
        const paginationPageSizeOption: number = this.pagination.getPageSize();
        const shouldAddAndSelectEmptyOption =
            !paginationPageSizeOption || !pageSizeOptions.includes(paginationPageSizeOption);
        if (shouldAddAndSelectEmptyOption) {
            const pageSizeSet = this.panelParams?.paginationPageSize != null || this.gos.exists('paginationPageSize');
            const pageSizesSet = this.getPageSizeSelectorOption() !== true;

            this.beans.log.warn(94, { pageSizeSet, pageSizesSet, pageSizeOptions, paginationPageSizeOption });
            if (!pageSizesSet) {
                this.beans.log.warn(95, { paginationPageSizeOption, paginationPageSizeSelector });
            }
            // When the paginationPageSize option is set to a value that is
            // not in the list of page size options.
            pageSizeOptions.unshift('');
        }

        const value = String(shouldAddAndSelectEmptyOption ? '' : paginationPageSizeOption);

        if (this.selectPageSizeComp) {
            if (!_areEqual(this.pageSizeOptions, pageSizeOptions)) {
                this.selectPageSizeComp.clearOptions().addOptions(this.createPageSizeSelectOptions(pageSizeOptions));
                this.pageSizeOptions = pageSizeOptions;
            }
            this.selectPageSizeComp.setValue(value, true);
        } else {
            this.createPageSizeSelectorComp(pageSizeOptions, value);
        }

        this.hasEmptyOption = shouldAddAndSelectEmptyOption;
    }

    private createPageSizeSelectOptions(pageSizeOptions: (string | number)[]): ListOption<string>[] {
        return pageSizeOptions.map((value) => ({
            value: String(value),
        }));
    }

    private createPageSizeSelectorComp(pageSizeOptions: (string | number)[], value: string): void {
        const localeTextFunc = this.getLocaleTextFunc();

        const localisedLabel = localeTextFunc('pageSizeSelectorLabel', 'Page Size:');
        const localisedAriaLabel = localeTextFunc('ariaPageSizeSelectorLabel', 'Page Size');

        this.selectPageSizeComp = this.createManagedBean<GridSelect>(new AgSelect())
            .addOptions(this.createPageSizeSelectOptions(pageSizeOptions))
            .setValue(value)
            .setAriaLabel(localisedAriaLabel)
            .setLabel(localisedLabel)
            .onValueChange(() => this.handlePageSizeItemSelected());

        this.appendChild(this.selectPageSizeComp);
    }

    private getPageSizeSelectorValues(): number[] {
        const defaultValues = [20, 50, 100];
        const paginationPageSizeSelectorValues = this.getPageSizeSelectorOption();

        if (!Array.isArray(paginationPageSizeSelectorValues) || !paginationPageSizeSelectorValues?.length) {
            return defaultValues;
        }

        return [...paginationPageSizeSelectorValues].sort((a, b) => a - b);
    }

    public override destroy() {
        this.toggleSelectDisplay(false);
        super.destroy();
    }
}
