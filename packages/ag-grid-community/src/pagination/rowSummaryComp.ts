import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { Component } from '../widgets/component';
import type { PaginationService } from './paginationService';

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

    public refresh(): void {
        const rowSummary = this.pagination.getRowSummary();
        const localeTextFunc = this.getLocaleTextFunc();

        this.lbFirstRowOnPage.textContent = rowSummary.firstRow;
        this.lbLastRowOnPage.textContent = rowSummary.lastRow;
        this.lbRecordCount.textContent = rowSummary.rowCount;
        this.ariaStatus = rowSummary.ariaStatus;
        const strTo = localeTextFunc('to', 'to');
        const strOf = localeTextFunc('of', 'of');

        const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\s+/g, ' ');
        this.getGui().style.setProperty(
            '--ag-internal-pagination-width-string',
            `'${rowSummary.rowCount} ${esc(strTo)} ${rowSummary.rowCount} ${esc(strOf)} ${rowSummary.rowCount}'`.replaceAll(
                /\d/g,
                '0'
            )
        );
    }
}
