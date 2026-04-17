import { RefPlaceholder } from '../agStack/interfaces/agComponent';
import type { BeanCollection } from '../context/context';
import { Component } from '../widgets/component';
import type { PaginationService } from './paginationService';
import { _formatPaginationNumber } from './paginationUtils';

export class RowSummaryComp extends Component {
    private pagination: PaginationService;

    private readonly lbFirstRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbLastRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbRecordCount: HTMLElement = RefPlaceholder;

    private lastAriaStatus = '';

    private readonly idPrefix: string;

    constructor(idPrefix: string) {
        super();
        this.idPrefix = idPrefix;
    }

    public wireBeans(beans: BeanCollection): void {
        this.pagination = beans.pagination!;
    }

    public postConstruct(): void {
        const idPrefix = this.idPrefix;
        const localeTextFunc = this.getLocaleTextFunc();

        this.setTemplate({
            tag: 'span',
            cls: 'ag-paging-row-summary-panel',
            children: [
                {
                    tag: 'span',
                    ref: 'lbFirstRowOnPage',
                    cls: 'ag-paging-row-summary-panel-number',
                    attrs: { id: `${idPrefix}-first-row` },
                },
                { tag: 'span', attrs: { id: `${idPrefix}-to` }, children: localeTextFunc('to', 'to') },
                {
                    tag: 'span',
                    ref: 'lbLastRowOnPage',
                    cls: 'ag-paging-row-summary-panel-number',
                    attrs: { id: `${idPrefix}-last-row` },
                },
                { tag: 'span', attrs: { id: `${idPrefix}-of` }, children: localeTextFunc('of', 'of') },
                {
                    tag: 'span',
                    ref: 'lbRecordCount',
                    cls: 'ag-paging-row-summary-panel-number',
                    attrs: { id: `${idPrefix}-row-count` },
                },
            ],
        });

        this.refresh();
    }

    private isZeroPages(): boolean {
        return this.beans.rowModel.isLastRowIndexKnown() && this.pagination.getTotalPages() === 0;
    }

    public refresh(): void {
        const lastPageFound = this.beans.rowModel.isLastRowIndexKnown();
        const masterRowCount = this.pagination.getMasterRowCount();
        const rowCount = lastPageFound ? masterRowCount : null;
        const currentPage = this.pagination.getCurrentPage();
        const pageSize = this.pagination.getPageSize();
        const localeTextFunc = this.getLocaleTextFunc();

        let startRow: number;
        let endRow: number;

        if (this.isZeroPages()) {
            startRow = endRow = 0;
        } else {
            startRow = pageSize * currentPage + 1;
            endRow = startRow + pageSize - 1;
            if (lastPageFound && endRow > rowCount!) {
                endRow = rowCount!;
            }
        }

        const theoreticalEndRow = startRow + pageSize - 1;
        const isLoadingPageSize = !lastPageFound && masterRowCount < theoreticalEndRow;

        const lbFirstRowOnPage = this.formatNumber(startRow);
        this.lbFirstRowOnPage.textContent = lbFirstRowOnPage;

        let lbLastRowOnPage: string;
        if (isLoadingPageSize) {
            lbLastRowOnPage = localeTextFunc('pageLastRowUnknown', '?');
        } else {
            lbLastRowOnPage = this.formatNumber(endRow);
        }
        this.lbLastRowOnPage.textContent = lbLastRowOnPage;

        let lbRecordCount: string;
        if (lastPageFound) {
            lbRecordCount = this.formatNumber(rowCount!);
        } else {
            lbRecordCount = localeTextFunc('more', 'more');
        }
        this.lbRecordCount.textContent = lbRecordCount;

        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        this.lastAriaStatus = `${lbFirstRowOnPage} ${strTo} ${lbLastRowOnPage} ${strOf} ${lbRecordCount}`;
    }

    public getAriaStatus(): string {
        return this.lastAriaStatus;
    }

    private formatNumber(value: number): string {
        return _formatPaginationNumber(value, this.gos, this.getLocaleTextFunc.bind(this));
    }
}
