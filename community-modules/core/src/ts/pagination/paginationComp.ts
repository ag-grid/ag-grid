import { Component } from "../widgets/component";
import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import {GridListener, GuiListener, RefSelector} from "../widgets/componentAnnotations";
import { EventService } from "../eventService";
import { Events } from "../events";
import { RowRenderer } from "../rendering/rowRenderer";
import { PaginationProxy } from "./paginationProxy";
import { _ } from "../utils";
import { IServerSideRowModel } from "../interfaces/iServerSideRowModel";
import { IRowModel } from "../interfaces/iRowModel";
import { Constants } from "../constants";

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('rowModel') private rowModel: IRowModel;

    @RefSelector('btFirst') private btFirst: HTMLElement;
    @RefSelector('btPrevious') private btPrevious: HTMLElement;
    @RefSelector('btNext') private btNext: HTMLElement;
    @RefSelector('btLast') private btLast: HTMLElement;

    @RefSelector('lbRecordCount') private lbRecordCount: any;
    @RefSelector('lbFirstRowOnPage') private lbFirstRowOnPage: any;
    @RefSelector('lbLastRowOnPage') private lbLastRowOnPage: any;
    @RefSelector('eSummaryPanel') private eSummaryPanel: any;
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
    private postConstruct(): void {
        const isRtl = this.gridOptionsWrapper.isEnableRtl();
        this.setTemplate(this.getTemplate());
        this.btFirst.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'last' : 'first', this.gridOptionsWrapper));
        this.btPrevious.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'next' : 'previous', this.gridOptionsWrapper));
        this.btNext.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'previous' : 'next', this.gridOptionsWrapper));
        this.btLast.insertAdjacentElement('afterbegin', _.createIconNoSpan(isRtl ? 'first' : 'last', this.gridOptionsWrapper));

        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_SERVER_SIDE) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }

        const isPaging = this.gridOptionsWrapper.isPagination();
        const paginationPanelEnabled = isPaging && !this.gridOptionsWrapper.isSuppressPaginationPanel();
        if (!paginationPanelEnabled) {
            this.setDisplayed(false);
            return;
        }

        // this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));

        // this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));

        this.onPaginationChanged();
    }

    @GridListener(Events.EVENT_PAGINATION_CHANGED)
    private onPaginationChanged(): void {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    }

    @GuiListener('btFirst','click')
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
            return userFunc({value: value});
        } else {
            return _.formatNumberCommas(value);
        }
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

        return `<div class="ag-paging-panel ag-unselectable">
                <span ref="eSummaryPanel" class="ag-paging-row-summary-panel">
                    <span ref="lbFirstRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    ${strTo}
                    <span ref="lbLastRowOnPage" class="ag-paging-row-summary-panel-number"></span>
                    ${strOf}
                    <span ref="lbRecordCount" class="ag-paging-row-summary-panel-number"></span>
                </span>
                <span class="ag-paging-page-summary-panel">
                    <div ref="btFirst" class="ag-paging-button-wrapper">
                        <button type="button" class="ag-paging-button">${strFirst}</button>
                    </div>
                    <div ref="btPrevious" class="ag-paging-button-wrapper">
                        <button type="button" class="ag-paging-button">${strPrevious}</button>
                    </div>
                    <span class="ag-paging-description">
                        ${strPage}
                        <span ref="lbCurrent" class="ag-paging-number"></span>
                        ${strOf}
                        <span ref="lbTotal" class="ag-paging-number"></span>
                    </span>
                    <span ref="lbTotal" class="ag-paging-number"></span>
                    <div ref="btNext" class="ag-paging-button-wrapper">
                        <button type="button" class="ag-paging-button">${strNext}</button>
                    </div>
                    <div ref="btLast" class="ag-paging-button-wrapper">
                        <button type="button" class="ag-paging-button">${strLast}</button>
                    </div>
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
        _.addOrRemoveCssClass(this.btPrevious, 'ag-disabled', this.previousAndFirstButtonsDisabled);
        _.addOrRemoveCssClass(this.btFirst, 'ag-disabled', this.previousAndFirstButtonsDisabled);

        const zeroPagesToDisplay = this.isZeroPagesToDisplay();
        const onLastPage = maxRowFound && currentPage === (totalPages - 1);

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        _.addOrRemoveCssClass(this.btNext, 'ag-disabled', this.nextButtonDisabled);

        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        _.addOrRemoveCssClass(this.btLast, 'ag-disabled', this.lastButtonDisabled);
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
            startRow = 0;
            endRow = 0;
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
