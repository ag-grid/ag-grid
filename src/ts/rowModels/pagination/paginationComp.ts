
import {Component} from "../../widgets/component";
import {Autowired, PostConstruct} from "../../context/context";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RefSelector} from "../../widgets/componentAnnotations";
import {ServerPaginationService, IPaginationService} from "./serverPaginationService";
import {_} from "../../utils";
import {EventService} from "../../eventService";
import {Events} from "../../events";
import {RowRenderer} from "../../rendering/rowRenderer";
import {PaginationProxy} from "../paginationProxy";

export class PaginationComp extends Component {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('serverPaginationService') private serverPaginationService: ServerPaginationService;
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

    private paginationService: IPaginationService;

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

        if (this.gridOptionsWrapper.isPagination()) {
            this.paginationService = this.paginationProxy;
        } else {
            this.paginationService = this.serverPaginationService;
        }

        this.onPaginationChanged();
    }

    private onPaginationChanged(): void{
        this.enableOrDisableButtons();
        this.updateRowLabels();
        this.setCurrentPageLabel();
        this.setTotalLabels();
    }

    private setCurrentPageLabel(): void {
        let currentPage = this.paginationService.getCurrentPage();
        this.lbCurrent.innerHTML = _.formatNumberCommas(currentPage + 1);
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
        let rowCount = this.paginationService.isLastPageFound() ?
            this.paginationService.getTotalRowCount() : null;

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
        this.lbFirstRowOnPage.innerHTML = _.formatNumberCommas(startRow);
        this.lbLastRowOnPage.innerHTML = _.formatNumberCommas(endRow);
    }

    private isZeroPagesToDisplay() {
        let maxRowFound = this.paginationService.isLastPageFound();
        let totalPages = this.paginationService.getTotalPages();
        return maxRowFound && totalPages === 0;
    }

    private setTotalLabels() {
        let lastPageFound = this.paginationService.isLastPageFound();
        let totalPages = this.paginationService.getTotalPages();
        let rowCount = this.paginationService.isLastPageFound() ?
            this.paginationService.getTotalRowCount() : null;

        if (lastPageFound) {
            this.lbTotal.innerHTML = _.formatNumberCommas(totalPages);
            this.lbRecordCount.innerHTML = _.formatNumberCommas(rowCount);
        } else {
            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
            this.lbTotal.innerHTML = moreText;
            this.lbRecordCount.innerHTML = moreText;
        }
    }
}