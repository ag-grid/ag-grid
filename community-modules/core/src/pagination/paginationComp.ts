import { KeyCode } from '../constants/keyCode';
import type { BeanCollection } from '../context/context';
import type { PaginationNumberFormatterParams } from '../interfaces/iCallbackParams';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { IRowModel } from '../interfaces/iRowModel';
import type { RowNodeBlockLoader } from '../rowNodeCache/rowNodeBlockLoader';
import { _setAriaDisabled } from '../utils/aria';
import { _createIconNoSpan } from '../utils/icon';
import { _formatNumberCommas } from '../utils/number';
import type { ComponentSelector } from '../widgets/component';
import { Component, RefPlaceholder } from '../widgets/component';
import type { PageSizeSelectorComp } from './pageSizeSelector/pageSizeSelectorComp';
import { PageSizeSelectorSelector } from './pageSizeSelector/pageSizeSelectorComp';
import type { PaginationService } from './paginationService';

export class PaginationComp extends Component {
    private rowNodeBlockLoader?: RowNodeBlockLoader;
    private rowModel: IRowModel;
    private paginationService: PaginationService;

    public wireBeans(beans: BeanCollection): void {
        this.rowNodeBlockLoader = beans.rowNodeBlockLoader;
        this.rowModel = beans.rowModel;
        this.paginationService = beans.paginationService!;
    }

    private readonly btFirst: HTMLElement = RefPlaceholder;
    private readonly btPrevious: HTMLElement = RefPlaceholder;
    private readonly btNext: HTMLElement = RefPlaceholder;
    private readonly btLast: HTMLElement = RefPlaceholder;

    private readonly lbRecordCount: any = RefPlaceholder;
    private readonly lbFirstRowOnPage: any = RefPlaceholder;
    private readonly lbLastRowOnPage: any = RefPlaceholder;
    private readonly lbCurrent: any = RefPlaceholder;
    private readonly lbTotal: any = RefPlaceholder;

    private readonly pageSizeComp: PageSizeSelectorComp = RefPlaceholder;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;
    private areListenersSetup = false;

    constructor() {
        super();
    }

    public postConstruct(): void {
        const isRtl = this.gos.get('enableRtl');
        this.setTemplate(this.getTemplate(), [PageSizeSelectorSelector]);

        const { btFirst, btPrevious, btNext, btLast } = this;
        this.activateTabIndex([btFirst, btPrevious, btNext, btLast]);

        btFirst.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'last' : 'first', this.gos)!);
        btPrevious.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'next' : 'previous', this.gos)!);
        btNext.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'previous' : 'next', this.gos)!);
        btLast.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'first' : 'last', this.gos)!);

        this.addManagedPropertyListener('pagination', this.onPaginationChanged.bind(this));
        this.addManagedPropertyListener('suppressPaginationPanel', this.onPaginationChanged.bind(this));
        this.addManagedPropertyListeners(
            ['paginationPageSizeSelector', 'paginationAutoPageSize', 'suppressPaginationPanel'],
            () => this.onPageSizeRelatedOptionsChange()
        );

        this.pageSizeComp.toggleSelectDisplay(this.pageSizeComp.shouldShowPageSizeSelector());

        this.onPaginationChanged();
    }

    private onPaginationChanged(): void {
        const isPaging = this.gos.get('pagination');
        const paginationPanelEnabled = isPaging && !this.gos.get('suppressPaginationPanel');

        this.setDisplayed(paginationPanelEnabled);
        if (!paginationPanelEnabled) {
            return;
        }

        this.setupListeners();

        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
        this.onPageSizeRelatedOptionsChange();
    }

    private onPageSizeRelatedOptionsChange(): void {
        this.pageSizeComp.toggleSelectDisplay(this.pageSizeComp.shouldShowPageSizeSelector());
    }

    private setupListeners() {
        if (!this.areListenersSetup) {
            this.addManagedEventListeners({ paginationChanged: this.onPaginationChanged.bind(this) });

            [
                { el: this.btFirst, fn: this.onBtFirst.bind(this) },
                { el: this.btPrevious, fn: this.onBtPrevious.bind(this) },
                { el: this.btNext, fn: this.onBtNext.bind(this) },
                { el: this.btLast, fn: this.onBtLast.bind(this) },
            ].forEach((item) => {
                const { el, fn } = item;
                this.addManagedListeners(el, {
                    click: fn,
                    keydown: (e: KeyboardEvent) => {
                        if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                            e.preventDefault();
                            fn();
                        }
                    },
                });
            });
            this.areListenersSetup = true;
        }
    }

    private onBtFirst() {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationService.goToFirstPage();
        }
    }

    private setCurrentPageLabel(): void {
        const pagesExist = this.paginationService.getTotalPages() > 0;
        const currentPage = this.paginationService.getCurrentPage();
        const toDisplay = pagesExist ? currentPage + 1 : 0;

        this.lbCurrent.textContent = this.formatNumber(toDisplay);
    }

    private formatNumber(value: number): string {
        const userFunc = this.gos.getCallback('paginationNumberFormatter');

        if (userFunc) {
            const params: WithoutGridCommon<PaginationNumberFormatterParams> = { value: value };
            return userFunc(params);
        }

        const localeTextFunc = this.localeService.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');

        return _formatNumberCommas(value, thousandSeparator, decimalSeparator);
    }

    private getTemplate(): string {
        const localeTextFunc = this.localeService.getLocaleTextFunc();

        const strPage = localeTextFunc('page', 'Page');
        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        const strFirst = localeTextFunc('firstPage', 'First Page');
        const strPrevious = localeTextFunc('previousPage', 'Previous Page');
        const strNext = localeTextFunc('nextPage', 'Next Page');
        const strLast = localeTextFunc('lastPage', 'Last Page');
        const compId = this.getCompId();

        return /* html */ `<div class="ag-paging-panel ag-unselectable" id="ag-${compId}">
                <ag-page-size-selector data-ref="pageSizeComp"></ag-page-size-selector>
                <span class="ag-paging-row-summary-panel" role="status">
                    <span id="ag-${compId}-first-row" data-ref="lbFirstRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-to">${strTo}</span>
                    <span id="ag-${compId}-last-row" data-ref="lbLastRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-of">${strOf}</span>
                    <span id="ag-${compId}-row-count" data-ref="lbRecordCount" class="ag-paging-row-summary-panel-number"></span>
                </span>
                <span class="ag-paging-page-summary-panel" role="presentation">
                    <div data-ref="btFirst" class="ag-button ag-paging-button" role="button" aria-label="${strFirst}"></div>
                    <div data-ref="btPrevious" class="ag-button ag-paging-button" role="button" aria-label="${strPrevious}"></div>
                    <span class="ag-paging-description" role="status">
                        <span id="ag-${compId}-start-page">${strPage}</span>
                        <span id="ag-${compId}-start-page-number" data-ref="lbCurrent" class="ag-paging-number"></span>
                        <span id="ag-${compId}-of-page">${strOf}</span>
                        <span id="ag-${compId}-of-page-number" data-ref="lbTotal" class="ag-paging-number"></span>
                    </span>
                    <div data-ref="btNext" class="ag-button ag-paging-button" role="button" aria-label="${strNext}"></div>
                    <div data-ref="btLast" class="ag-button ag-paging-button" role="button" aria-label="${strLast}"></div>
                </span>
            </div>`;
    }

    private onBtNext() {
        if (!this.nextButtonDisabled) {
            this.paginationService.goToNextPage();
        }
    }

    private onBtPrevious() {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationService.goToPreviousPage();
        }
    }

    private onBtLast() {
        if (!this.lastButtonDisabled) {
            this.paginationService.goToLastPage();
        }
    }

    private enableOrDisableButtons() {
        const currentPage = this.paginationService.getCurrentPage();
        const maxRowFound = this.rowModel.isLastRowIndexKnown();
        const totalPages = this.paginationService.getTotalPages();

        this.previousAndFirstButtonsDisabled = currentPage === 0;
        this.toggleButtonDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);

        const zeroPagesToDisplay = this.isZeroPagesToDisplay();
        const onLastPage = currentPage === totalPages - 1;

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === totalPages - 1;

        this.toggleButtonDisabled(this.btNext, this.nextButtonDisabled);
        this.toggleButtonDisabled(this.btLast, this.lastButtonDisabled);
    }

    private toggleButtonDisabled(button: HTMLElement, disabled: boolean) {
        _setAriaDisabled(button, disabled);
        button.classList.toggle('ag-disabled', disabled);
    }

    private updateRowLabels() {
        const currentPage = this.paginationService.getCurrentPage();
        const pageSize = this.paginationService.getPageSize();
        const maxRowFound = this.rowModel.isLastRowIndexKnown();
        const rowCount = this.rowModel.isLastRowIndexKnown() ? this.paginationService.getMasterRowCount() : null;

        let startRow: any;
        let endRow: any;

        if (this.isZeroPagesToDisplay()) {
            startRow = endRow = 0;
        } else {
            startRow = pageSize * currentPage + 1;
            endRow = startRow + pageSize - 1;
            if (maxRowFound && endRow > rowCount!) {
                endRow = rowCount;
            }
        }

        this.lbFirstRowOnPage.textContent = this.formatNumber(startRow);
        if (this.rowNodeBlockLoader?.isLoading()) {
            const translate = this.localeService.getLocaleTextFunc();
            this.lbLastRowOnPage.innerHTML = translate('pageLastRowUnknown', '?');
        } else {
            this.lbLastRowOnPage.textContent = this.formatNumber(endRow);
        }
    }

    private isZeroPagesToDisplay() {
        const maxRowFound = this.rowModel.isLastRowIndexKnown();
        const totalPages = this.paginationService.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        const lastPageFound = this.rowModel.isLastRowIndexKnown();
        const totalPages = this.paginationService.getTotalPages();
        const rowCount = lastPageFound ? this.paginationService.getMasterRowCount() : null;

        // When `pivotMode=true` and no grouping or value columns exist, a single 'hidden' group row (root node) is in
        // the grid and the pagination totals will correctly display total = 1. However this is confusing to users as
        // they can't see it. To address this UX issue we simply set the totals to zero in the pagination panel.
        if (rowCount === 1) {
            const firstRow = this.rowModel.getRow(0);

            // a group node with no group or agg data will not be visible to users
            const hiddenGroupRow = firstRow && firstRow.group && !(firstRow.groupData || firstRow.aggData);
            if (hiddenGroupRow) {
                this.setTotalLabelsToZero();
                return;
            }
        }

        if (lastPageFound) {
            this.lbTotal.textContent = this.formatNumber(totalPages);
            this.lbRecordCount.textContent = this.formatNumber(rowCount!);
        } else {
            const moreText = this.localeService.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }

    private setTotalLabelsToZero() {
        this.lbFirstRowOnPage.textContent = this.formatNumber(0);
        this.lbCurrent.textContent = this.formatNumber(0);
        this.lbLastRowOnPage.textContent = this.formatNumber(0);
        this.lbTotal.textContent = this.formatNumber(0);
        this.lbRecordCount.textContent = this.formatNumber(0);
    }
}

export const PaginationSelector: ComponentSelector = {
    selector: 'AG-PAGINATION',
    component: PaginationComp,
};
