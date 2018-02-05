
import {Component} from "../../widgets/component";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RefSelector} from "../../widgets/componentAnnotations";
import {_} from "../../utils";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {RowRenderer} from "../../rendering/rowRenderer";
import {PaginationProxy} from "../paginationProxy";

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

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

        this.addDestroyableEventListener(this.eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));

        this.addDestroyableEventListener(this.btFirst, 'click', this.onBtFirst.bind(this));
        this.addDestroyableEventListener(this.btLast, 'click', this.onBtLast.bind(this));
        this.addDestroyableEventListener(this.btNext, 'click', this.onBtNext.bind(this));
        this.addDestroyableEventListener(this.btPrevious, 'click', this.onBtPrevious.bind(this));

        this.onPaginationChanged();
    }

    private onPaginationChanged(): void{
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    }

    private setCurrentPageLabel(): void {
        let pagesExist = this.paginationProxy.getTotalPages() > 0;
        let currentPage = this.paginationProxy.getCurrentPage();

        let toDisplay = pagesExist ? currentPage + 1 : 0;

        this.lbCurrent.innerHTML = this.formatNumber(toDisplay);
    }

    private formatNumber(value: number): string {
        var userFunc = this.gridOptionsWrapper.getPaginationNumberFormatterFunc();
        if (userFunc) {
            return userFunc({value: value});
        } else {
            return _.formatNumberCommas(value);
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
        this.paginationProxy.goToNextPage();
    }

    private onBtPrevious() {
        this.paginationProxy.goToPreviousPage();
    }

    private onBtFirst() {
        this.paginationProxy.goToFirstPage();
    }

    private onBtLast() {
        this.paginationProxy.goToLastPage();
    }

    private enableOrDisableButtons() {
        let currentPage = this.paginationProxy.getCurrentPage();
        let maxRowFound = this.paginationProxy.isLastPageFound();
        let totalPages = this.paginationProxy.getTotalPages();

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
        let currentPage = this.paginationProxy.getCurrentPage();
        let pageSize = this.paginationProxy.getPageSize();
        let maxRowFound = this.paginationProxy.isLastPageFound();
        let rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getTotalRowCount() : null;

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
        this.lbLastRowOnPage.innerHTML = this.formatNumber(endRow);
    }

    private isZeroPagesToDisplay() {
        let maxRowFound = this.paginationProxy.isLastPageFound();
        let totalPages = this.paginationProxy.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        let lastPageFound = this.paginationProxy.isLastPageFound();
        let totalPages = this.paginationProxy.getTotalPages();
        let rowCount = this.paginationProxy.isLastPageFound() ?
            this.paginationProxy.getTotalRowCount() : null;

        if (lastPageFound) {
            this.lbTotal.innerHTML = this.formatNumber(totalPages);
            this.lbRecordCount.innerHTML = this.formatNumber(rowCount);
        } else {
            let moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }
}