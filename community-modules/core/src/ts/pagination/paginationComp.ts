import { Component } from "../widgets/component";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { RefSelector } from "../widgets/componentAnnotations";
import { Events } from "../events";
import { PaginationProxy } from "./paginationProxy";
import { IServerSideRowModel } from "../interfaces/iServerSideRowModel";
import { IRowModel } from "../interfaces/iRowModel";
import { Constants } from "../constants/constants";
import { createIconNoSpan } from "../utils/icon";
import { formatNumberCommas } from "../utils/number";
import { addOrRemoveCssClass } from "../utils/dom";
import { setAriaDisabled } from "../utils/aria";
import { KeyCode } from '../constants/keyCode';

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowModel') private rowModel: IRowModel;

    @RefSelector('btFirst') private btFirst: HTMLElement;
    @RefSelector('btPrevious') private btPrevious: HTMLElement;
    @RefSelector('btNext') private btNext: HTMLElement;
    @RefSelector('btLast') private btLast: HTMLElement;

    @RefSelector('lbRecordCount') private lbRecordCount: any;
    @RefSelector('lbFirstRowOnPage') private lbFirstRowOnPage: any;
    @RefSelector('lbLastRowOnPage') private lbLastRowOnPage: any;
    @RefSelector('lbCurrent') private lbCurrent: any;
    @RefSelector('lbTotal') private lbTotal: any;

    private serverSideRowModel: IServerSideRowModel;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;

    constructor() {
        super();
    }

    @PostConstruct
    protected postConstruct(): void {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper));
        this.btPrevious.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper));
        this.btNext.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper));
        this.btLast.insertAdjacentElement('afterbegin', createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper));

        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }

        const isPaging = this.gridOptionsWrapper.isPagination();
        const paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();

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
                if (e.keyCode === KeyCode.ENTER || e.keyCode === KeyCode.SPACE) {
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

        if (userFunc) { return userFunc({ value: value }); }

        return formatNumberCommas(value);
    }

    private getTemplate(): string {
        const localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        const strPage = localeTextFunc('page', 'Page');
        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        const strFirst = localeTextFunc('first', 'First');
        const strPrevious = localeTextFunc('previous', 'Previous');
        const strNext = localeTextFunc('next', 'Next');
        const strLast = localeTextFunc('last', 'Last');
        const compId = this.getCompId();
        const summaryDescribedBy = `ag-${compId}-first-row ag-${compId}-to ag-${compId}-last-row ag-${compId}-of ag-${compId}-row-count`;
        const descriptionDescribedBy = `ag-${compId}-start-page ag-${compId}-start-page-number ag-${compId}-of-page ag-${compId}-of-page-number`;

        return /* html */`<div class="ag-paging-panel ag-unselectable" id="ag-${compId}" aria-live="polite" aria-describedby="${descriptionDescribedBy} ${summaryDescribedBy}">
                <span class="ag-paging-row-summary-panel" aria-hidden="true">
                    <span id="ag-${compId}-first-row" ref="lbFirstRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-to">${strTo}</span>
                    <span id="ag-${compId}-last-row" ref="lbLastRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    <span id="ag-${compId}-of">${strOf}</span>
                    <span id="ag-${compId}-row-count" ref="lbRecordCount" class="ag-paging-row-summary-panel-number"></span>
                </span>
                <span class="ag-paging-page-summary-panel" role="presentation">
                    <div ref="btFirst" class="ag-paging-button" role="button" aria-label="${strFirst}" tabindex="0"></div>
                    <div ref="btPrevious" class="ag-paging-button" role="button" aria-label="${strPrevious}" tabindex="0"></div>
                    <span class="ag-paging-description" aria-hidden="true">
                        <span id="ag-${compId}-start-page">${strPage}</span>
                        <span id="ag-${compId}-start-page-number" ref="lbCurrent" class="ag-paging-number"></span>
                        <span id="ag-${compId}-of-page">${strOf}</span>
                        <span id="ag-${compId}-of-page-number" ref="lbTotal" class="ag-paging-number"></span>
                    </span>
                    <div ref="btNext" class="ag-paging-button" role="button" aria-label="${strNext}" tabindex="0"></div>
                    <div ref="btLast" class="ag-paging-button" role="button" aria-label="${strLast}" tabindex="0"></div>
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
        addOrRemoveCssClass(this.btFirst, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        setAriaDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);

        addOrRemoveCssClass(this.btPrevious, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        setAriaDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);

        const zeroPagesToDisplay = this.isZeroPagesToDisplay();
        const onLastPage = maxRowFound && currentPage === (totalPages - 1);

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        addOrRemoveCssClass(this.btNext, 'ag-disabled', this.nextButtonDisabled);
        setAriaDisabled(this.btNext, this.nextButtonDisabled);

        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        addOrRemoveCssClass(this.btLast, 'ag-disabled', this.lastButtonDisabled);
        setAriaDisabled(this.btLast, this.lastButtonDisabled);
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
            if (maxRowFound && endRow > rowCount) {
                endRow = rowCount;
            }
        }

        this.lbFirstRowOnPage.innerHTML = this.formatNumber(startRow);
        if (this.serverSideRowModel && this.serverSideRowModel.isLoading()) {
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
        const rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getMasterRowCount() : null;

        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount);
        } else {
            const moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }
}
