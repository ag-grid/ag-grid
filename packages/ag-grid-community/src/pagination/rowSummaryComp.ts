import { RefPlaceholder } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { Component } from '../widgets/component';
import type { PaginationService } from './paginationService';
import {
    _formatPaginationNumber,
    _getPaginationTemplate,
    _getPaginationText,
    _splitPaginationTokens,
} from './paginationUtils';

export class RowSummaryComp extends Component {
    private pagination: PaginationService;

    private readonly lbFirstRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbLastRowOnPage: HTMLElement = RefPlaceholder;
    private readonly lbRecordCount: HTMLElement = RefPlaceholder;
    private readonly eSummaryContent: HTMLElement = RefPlaceholder;

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

        this.setTemplate({
            tag: 'span',
            cls: 'ag-paging-row-summary-panel',
            children: [
                {
                    tag: 'span',
                    ref: 'eSummaryContent',
                    cls: 'ag-paging-row-summary-content',
                    children: [
                        {
                            tag: 'span',
                            ref: 'lbFirstRowOnPage',
                            cls: 'ag-paging-row-summary-panel-number',
                            attrs: { id: `${idPrefix}-first-row` },
                        },
                        {
                            tag: 'span',
                            ref: 'lbLastRowOnPage',
                            cls: 'ag-paging-row-summary-panel-number',
                            attrs: { id: `${idPrefix}-last-row` },
                        },
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

        const first = formatNumber(startRow);
        const last = isLoadingPageSize ? localeTextFunc('pageLastRowUnknown', '?') : formatNumber(endRow);
        const count = lastPageFound ? formatNumber(rowCount!) : localeTextFunc('more', 'more');

        // Built from the existing words so a localeText without these keys reads as before.
        const defaultTemplate = `\${first} ${localeTextFunc('to', 'to')} \${last} ${localeTextFunc('of', 'of')} \${count}`;
        const template = _getPaginationTemplate(
            localeTextFunc,
            lastPageFound ? 'paginationRowSummary' : 'paginationRowSummaryUnknownTotal',
            defaultTemplate,
            { first, last, count }
        );
        this.renderSummary(template, { first, last, count });

        this.ariaStatus = this.getAriaStatus(first, last, count, { lastPageFound, isLoadingPageSize });

        // Reserves the width of the widest phrase: every number at the width of the count.
        const widthString = _splitPaginationTokens(template)
            .map((part, i) => (i % 2 ? count : part))
            .join('')
            .replace(/\\/g, '\\\\')
            .replace(/'/g, String.raw`\'`)
            .replace(/\s+/g, ' ')
            .replaceAll(/\d/g, '0');
        this.getGui().style.setProperty('--ag-internal-pagination-width-string', `'${widthString}'`);
    }

    /**
     * Places the number spans where the phrase has their tokens. A token's first occurrence gets its span, a repeat is
     * plain text, and a span whose token is missing is left out.
     */
    private renderSummary(template: string, values: { first: string; last: string; count: string }): void {
        const spans: Record<string, HTMLElement> = {
            first: this.lbFirstRowOnPage,
            last: this.lbLastRowOnPage,
            count: this.lbRecordCount,
        };
        const children = _splitPaginationTokens(template).map((part, i) => {
            if (i % 2 === 0) {
                return part;
            }
            const name = part as keyof typeof values;
            const span = spans[name];
            if (!span) {
                return values[name] ?? '';
            }
            delete spans[name];
            span.textContent = values[name];
            return span;
        });
        this.eSummaryContent.replaceChildren(...children.filter((child) => child !== ''));
    }

    /** Builds a self-contained screen reader sentence; the unknown-total cases avoid announcing the visible `?` / `more`. */
    private getAriaStatus(
        first: string,
        last: string,
        count: string,
        { lastPageFound, isLoadingPageSize }: { lastPageFound: boolean; isLoadingPageSize: boolean }
    ): string {
        const localeTextFunc = this.getLocaleTextFunc();
        if (isLoadingPageSize) {
            return _getPaginationText(
                localeTextFunc,
                'ariaPaginationRowSummaryLoading',
                'Loading records from ${first}',
                {
                    first,
                }
            );
        }
        if (!lastPageFound) {
            return _getPaginationText(
                localeTextFunc,
                'ariaPaginationRowSummaryUnknownTotal',
                'Showing records ${first} to ${last}, total unknown',
                { first, last }
            );
        }
        return _getPaginationText(
            localeTextFunc,
            'ariaPaginationRowSummary',
            'Showing records ${first} to ${last} of ${count}',
            { first, last, count }
        );
    }
}
