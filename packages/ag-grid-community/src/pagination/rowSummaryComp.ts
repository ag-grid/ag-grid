import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { Component } from '../widgets/component';
import type { PaginationService } from './paginationService';
import { _formatPaginationNumber } from './paginationUtils';

export class RowSummaryComp extends Component {
    private pagination: PaginationService;

    private readonly lbFirstRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbLastRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbRecordCount: HTMLElement = RefPlaceholder;

    public ariaStatus = '';

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
                    cls: 'ag-paging-row-summary-content',
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
                },
            ],
        });

        this.refresh();
    }

    private isZeroPages(): boolean {
        return this.beans.rowModel.isLastRowIndexKnown() && this.pagination.getTotalPages() === 0;
    }

    public refresh(): void {
        const {
            pagination,
            beans: { rowModel },
            gos,
        } = this;
        const lastPageFound = rowModel.isLastRowIndexKnown();
        const masterRowCount = pagination.getMasterRowCount();
        const rowCount = lastPageFound ? masterRowCount : null;
        const currentPage = pagination.getCurrentPage();
        const pageSize = pagination.getPageSize();
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

        const formatNumber = (value: number) => _formatPaginationNumber(value, gos, this.getLocaleTextFunc.bind(this));

        const lbFirstRowOnPage = formatNumber(startRow);
        this.lbFirstRowOnPage.textContent = lbFirstRowOnPage;

        let lbLastRowOnPage: string;
        if (isLoadingPageSize) {
            lbLastRowOnPage = localeTextFunc('pageLastRowUnknown', '?');
        } else {
            lbLastRowOnPage = formatNumber(endRow);
        }
        this.lbLastRowOnPage.textContent = lbLastRowOnPage;

        let lbRecordCount: string;
        if (lastPageFound) {
            lbRecordCount = formatNumber(rowCount!);
        } else {
            lbRecordCount = localeTextFunc('more', 'more');
        }
        this.lbRecordCount.textContent = lbRecordCount;

        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');
        this.ariaStatus = `${lbFirstRowOnPage} ${strTo} ${lbLastRowOnPage} ${strOf} ${lbRecordCount}`;

        const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\s+/g, ' ');
        this.getGui().style.setProperty(
            '--ag-internal-pagination-width-string',
            `'${lbRecordCount} ${esc(strTo)} ${lbRecordCount} ${esc(strOf)} ${lbRecordCount}'`.replaceAll(/\d/g, '0')
        );
    }
}
