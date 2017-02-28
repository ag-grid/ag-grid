
import {Component} from "../../widgets/component";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RefSelector} from "../../widgets/componentAnnotations";
import {PaginationService} from "./paginationService";
import {_} from "../../utils";
import {EventService} from "../../eventService";
import {Events} from "../../events";

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('paginationService') private paginationService: PaginationService;
    @Autowired('eventService') private eventService: EventService;

    @RefSelector('btFirst') private btFirst: HTMLButtonElement;
    @RefSelector('btPrevious') private btPrevious: HTMLButtonElement;
    @RefSelector('btNext') private btNext: HTMLButtonElement;
    @RefSelector('btLast') private btLast: HTMLButtonElement;

    @RefSelector('lbRecordCount') private lbRecordCount: any;
    @RefSelector('lbFirstRowOnPage') private lbFirstRowOnPage: any;
    @RefSelector('lbLastRowOnPage') private lbLastRowOnPage: any;
    @RefSelector('eSummaryPanel') private eSummaryPanel: any;
    @RefSelector('lbCurrent') private lbCurrent: any;
    @RefSelector('lbTotal') private lbTotal: any;

    constructor() {
        super();
    }

    @PostConstruct
    private postConstruct(): void {
        this.setTemplate(this.getTemplate());

        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_RESET, this.onPaginationReset.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_PAGE_LOADED, this.onPageLoaded.bind(this));
        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_PAGE_REQUESTED, this.onPageRequested.bind(this));

        this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));
    }

    private onPaginationReset(): void {
        this.showSummaryPanel(false);
        this.setTotalLabels();
    }

    private showSummaryPanel(show: boolean): void {
        _.setHidden(this.eSummaryPanel, !show);
    }

    private onPageRequested(): void {
        this.enableOrDisableButtons();
        let currentPage = this.paginationService.getCurrentPage();
        this.lbCurrent.innerHTML = this.myToLocaleString(currentPage + 1);
    }

    private onPageLoaded(): void {
        this.enableOrDisableButtons();
        this.updateRowLabels();
        if (this.paginationService.isLastPageFound()) {
            this.setTotalLabels();
        }
    }

    private getTemplate(): string {

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();

        let strPage = localeTextFunc('page', 'Page');
        let strTo = localeTextFunc('to', 'to');
        let strOf = localeTextFunc('of', 'of');
        let strFirst = localeTextFunc('first', 'First');
        let strPrevious = localeTextFunc('previous', 'Previous');
        let strNext = localeTextFunc('next', 'Next');
        let strLast = localeTextFunc('last', 'Last');

        return `<div class="ag-paging-panel ag-font-style">
                <span ref="eSummaryPanel" class="ag-paging-row-summary-panel">
                    <span ref="lbFirstRowOnPage"></span> ${strTo} <span ref="lbLastRowOnPage"></span> ${strOf} <span ref="lbRecordCount"></span>
                </span>
                <span class="ag-paging-page-summary-panel">
                    <button class="ag-paging-button" ref="btFirst">${strFirst}</button>
                    <button class="ag-paging-button" ref="btPrevious">${strPrevious}</button>
                    ${strPage} <span ref="lbCurrent"></span> ${strOf} <span ref="lbTotal"></span>
                    <button class="ag-paging-button" ref="btNext">${strNext}</button>
                    <button class="ag-paging-button" ref="btLast">${strLast}</button>
                </span>
            </div>`;
    }

    private onBtNext() {
        this.paginationService.goToNextPage();
    }

    private onBtPrevious() {
        this.paginationService.goToPreviousPage();
    }

    private onBtFirst() {
        this.paginationService.goToFirstPage();
    }

    private onBtLast() {
        this.paginationService.goToLastPage();
    }

    private enableOrDisableButtons() {
        let currentPage = this.paginationService.getCurrentPage();
        let maxRowFound = this.paginationService.isLastPageFound();
        let totalPages = this.paginationService.getTotalPages();

        let disablePreviousAndFirst = currentPage === 0;
        this.btPrevious.disabled = disablePreviousAndFirst;
        this.btFirst.disabled = disablePreviousAndFirst;

        let zeroPagesToDisplay = this.isZeroPagesToDisplay();
        let onLastPage = maxRowFound && currentPage === (totalPages - 1);

        let disableNext = onLastPage || zeroPagesToDisplay;
        this.btNext.disabled = disableNext;

        let disableLast = !maxRowFound || zeroPagesToDisplay || currentPage === (totalPages - 1);
        this.btLast.disabled = disableLast;
    }

    private updateRowLabels() {
        let currentPage = this.paginationService.getCurrentPage();
        let pageSize = this.paginationService.getPageSize();
        let maxRowFound = this.paginationService.isLastPageFound();
        let rowCount = this.paginationService.getRowCount();

        var startRow: any;
        var endRow: any;
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
        this.lbFirstRowOnPage.innerHTML = this.myToLocaleString(startRow);
        this.lbLastRowOnPage.innerHTML = this.myToLocaleString(endRow);

        this.showSummaryPanel(true);
    }

    private isZeroPagesToDisplay() {
        let maxRowFound = this.paginationService.isLastPageFound();
        let totalPages = this.paginationService.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        let maxRowFound = this.paginationService.isLastPageFound();
        let totalPages = this.paginationService.getTotalPages();
        let rowCount = this.paginationService.getRowCount();

        if (maxRowFound) {
            this.lbTotal.innerHTML = this.myToLocaleString(totalPages);
            this.lbRecordCount.innerHTML = this.myToLocaleString(rowCount);
        } else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }

    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
    private myToLocaleString(input: number): string {
        if (typeof input !== 'number') {
            return '';
        } else {
            // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
            return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    }
}