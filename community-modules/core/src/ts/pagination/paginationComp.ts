import { Component } from "../widgets/component";
import { Autowired, PostConstruct } from "../context/context";
import { RefSelector } from "../widgets/componentAnnotations";
import { Events } from "../events";
import { PaginationProxy } from "./paginationProxy";
import { createIconNoSpan } from "../utils/icon";
import { formatNumberCommas } from "../utils/number";
import { setAriaDisabled } from "../utils/aria";
import { KeyCode } from '../constants/keyCode';
import { RowNodeBlockLoader } from "../rowNodeCache/rowNodeBlockLoader";
import { PaginationNumberFormatterParams } from "../entities/iCallbackParams";
import { WithoutGridCommon } from "../interfaces/iCommon";

export class PaginationComp extends Component {

    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;

    @RefSelector('btFirst') private btFirst: HTMLElement;
    @RefSelector('btPrevious') private btPrevious: HTMLElement;
    @RefSelector('btNext') private btNext: HTMLElement;
    @RefSelector('btLast') private btLast: HTMLElement;

    @RefSelector('lbRecordCount') private lbRecordCount: any;
    @RefSelector('lbFirstRowOnPage') private lbFirstRowOnPage: any;
    @RefSelector('lbLastRowOnPage') private lbLastRowOnPage: any;
    @RefSelector('lbCurrent') private lbCurrent: any;
    @RefSelector('lbTotal') private lbTotal: any;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;

    constructor() {
        super();
    }

    @PostConstruct
    protected postConstruct(): void {
        const isRtl = this.gridOptionsService.is('enableRtl');
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper)!);
        this.btPrevious.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper)!);
        this.btNext.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper)!);
        this.btLast.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper)!);

        const isPaging = this.gridOptionsService.is('pagination');
        const paginationPanelEnabled = isPaging && !this.gridOptionsService.is('suppressPaginationPanel');

        if (!paginationPanelEnabled) {
            this.setDisplayed(false);
            return;
        }

        this.addManagedListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));

        [
            { el: this.btFirst, fn: this.onBtFirst.bind(this) },
            { el: this.btPrevious, fn: this.onBtPrevious.bind(this) },
            { el: this.btNext, fn: this.onBtNext.bind(this) },
            { el: this.btLast, fn: this.onBtLast.bind(this) }
        ].forEach(item => {
            const { el, fn } = item;
            this.addManagedListener(el, 'click', fn);
            this.addManagedListener(el, 'keydown', (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                    e.preventDefault();
                    fn();
                }
            });
        });

        this.onPaginationChanged();
    }

    private onPaginationChanged(): void {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    }

    private onBtFirst() {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationProxy.goToFirstPage();
        }
    }

    private setCurrentPageLabel(): void {
        const pagesExist = this.paginationProxy.getTotalPages() > 0;
        const currentPage = this.paginationProxy.getCurrentPage();
        const toDisplay = pagesExist ? currentPage + 1 : 0;

        this.lbCurrent.innerHTML = this.formatNumber(toDisplay);
    }

    private formatNumber(value: number): string {
        const userFunc = this.gridOptionsWrapper.getPaginationNumberFormatterFunc();

        if (userFunc) {
            const params: WithoutGridCommon<PaginationNumberFormatterParams> = { value: value };
            return userFunc(params);
        }

        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        const thousandSeparator = localeTextFunc('thousandSeparator', ',');
        const decimalSeparator = localeTextFunc('decimalSeparator', '.');

        return formatNumberCommas(value, thousandSeparator, decimalSeparator);
    }

    private getTemplate(): string {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        const strPage = localeTextFunc('page', 'Page');
        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        const strFirst = localeTextFunc('firstPage', 'First Page');
        const strPrevious = localeTextFunc('previousPage', 'Previous Page');
        const strNext = localeTextFunc('nextPage', 'Next Page');
        const strLast = localeTextFunc('lastPage', 'Last Page');
        const compId = this.getCompId();

        return /* html */`<div class="ag-paging-panel ag-unselectable" id="ag-${compId}">
                <span class="ag-paging-row-summary-panel" role="status">
                    <span id="ag-${compId}-first-row" ref="lbFirstRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-to">${strTo}</span>
                    <span id="ag-${compId}-last-row" ref="lbLastRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-of">${strOf}</span>
                    <span id="ag-${compId}-row-count" ref="lbRecordCount" class="ag-paging-row-summary-panel-number"></span>
                </span>
                <span class="ag-paging-page-summary-panel" role="presentation">
                    <div ref="btFirst" class="ag-paging-button" role="button" aria-label="${strFirst}"></div>
                    <div ref="btPrevious" class="ag-paging-button" role="button" aria-label="${strPrevious}"></div>
                    <span class="ag-paging-description" role="status">
                        <span id="ag-${compId}-start-page">${strPage}</span>
                        <span id="ag-${compId}-start-page-number" ref="lbCurrent" class="ag-paging-number"></span>
                        <span id="ag-${compId}-of-page">${strOf}</span>
                        <span id="ag-${compId}-of-page-number" ref="lbTotal" class="ag-paging-number"></span>
                    </span>
                    <div ref="btNext" class="ag-paging-button" role="button" aria-label="${strNext}"></div>
                    <div ref="btLast" class="ag-paging-button" role="button" aria-label="${strLast}"></div>
                </span>
            </div>`;
    }

    private onBtNext() {
        if (!this.nextButtonDisabled) {
            this.paginationProxy.goToNextPage();
        }
    }

    private onBtPrevious() {
        if (!this.previousAndFirstButtonsDisabled) {
            this.paginationProxy.goToPreviousPage();
        }
    }

    private onBtLast() {
        if (!this.lastButtonDisabled) {
            this.paginationProxy.goToLastPage();
        }
    }

    private enableOrDisableButtons() {
        const currentPage = this.paginationProxy.getCurrentPage();
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();

        this.previousAndFirstButtonsDisabled = currentPage === 0;
        this.toggleButtonDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);

        const zeroPagesToDisplay = this.isZeroPagesToDisplay();
        const onLastPage = maxRowFound && currentPage === (totalPages - 1);

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);

        this.toggleButtonDisabled(this.btNext, this.nextButtonDisabled);
        this.toggleButtonDisabled(this.btLast, this.lastButtonDisabled);
    }

    private toggleButtonDisabled(button: HTMLElement, disabled: boolean) {
        setAriaDisabled(button, disabled);
        button.classList.toggle('ag-disabled', disabled);

        if (disabled) {
            button.removeAttribute('tabindex');
        } else {
            button.setAttribute('tabindex', '0');
        }
    }

    private updateRowLabels() {
        const currentPage = this.paginationProxy.getCurrentPage();
        const pageSize = this.paginationProxy.getPageSize();
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getMasterRowCount() : null;

        let startRow: any;
        let endRow: any;

        if (this.isZeroPagesToDisplay()) {
            startRow = endRow = 0;
        } else {
            startRow = (pageSize * currentPage) + 1;
            endRow = startRow + pageSize - 1;
            if (maxRowFound && endRow > rowCount!) {
                endRow = rowCount;
            }
        }

        this.lbFirstRowOnPage.innerHTML = this.formatNumber(startRow);
        if (this.rowNodeBlockLoader.isLoading()) {
            this.lbLastRowOnPage.innerHTML = '?';
        } else {
            this.lbLastRowOnPage.innerHTML = this.formatNumber(endRow);
        }
    }

    private isZeroPagesToDisplay() {
        const maxRowFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        const lastPageFound = this.paginationProxy.isLastPageFound();
        const totalPages = this.paginationProxy.getTotalPages();
        const rowCount = lastPageFound ? this.paginationProxy.getMasterRowCount() : null;

        // When `pivotMode=true` and no grouping or value columns exist, a single 'hidden' group row (root node) is in
        // the grid and the pagination totals will correctly display total = 1. However this is confusing to users as
        // they can't see it. To address this UX issue we simply set the totals to zero in the pagination panel.
        if (rowCount === 1) {
            const firstRow = this.paginationProxy.getRow(0);

            // a group node with no group or agg data will not be visible to users
            const hiddenGroupRow = firstRow && firstRow.group && !(firstRow.groupData || firstRow.aggData);
            if (hiddenGroupRow) {
                this.setTotalLabelsToZero();
                return;
            }
        }

        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount!);
        } else {
            const moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }

    private setTotalLabelsToZero() {
        this.lbFirstRowOnPage.innerHTML = this.formatNumber(0);
        this.lbCurrent.innerHTML = this.formatNumber(0);
        this.lbLastRowOnPage.innerHTML = this.formatNumber(0);
        this.lbTotal.innerHTML = this.formatNumber(0);
        this.lbRecordCount.innerHTML = this.formatNumber(0);
    }
}
