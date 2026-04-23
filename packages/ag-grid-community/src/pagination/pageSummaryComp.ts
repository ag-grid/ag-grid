import { KeyCode } from '../agStack/constants/keyCode';
import { RefPlaceholder } from '../agStack/interfaces/agComponent';
import { _setAriaDisabled } from '../agStack/utils/aria';
import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import { _createIconNoSpan } from '../utils/icon';
import { Component } from '../widgets/component';
import type { PaginationService } from './paginationService';
import { _formatPaginationNumber } from './paginationUtils';

export class PageSummaryComp extends Component {
    private rowModel: IRowModel;
    private pagination: PaginationService;

    private readonly btFirst: HTMLElement = RefPlaceholder;
    private readonly btPrevious: HTMLElement = RefPlaceholder;
    private readonly btNext: HTMLElement = RefPlaceholder;
    private readonly btLast: HTMLElement = RefPlaceholder;
    private readonly lbCurrent: HTMLElement = RefPlaceholder;
    private readonly lbTotal: HTMLElement = RefPlaceholder;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;

    public ariaStatus = '';
    private readonly idPrefix: string;

    constructor(idPrefix: string) {
        super();
        this.idPrefix = idPrefix;
    }

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.pagination = beans.pagination!;
    }

    public postConstruct(): void {
        const idPrefix = this.idPrefix;
        const localeTextFunc = this.getLocaleTextFunc();

        this.setTemplate({
            tag: 'span',
            cls: 'ag-paging-page-summary-panel',
            role: 'presentation',
            children: [
                {
                    tag: 'div',
                    ref: 'btFirst',
                    cls: 'ag-button ag-paging-button',
                    role: 'button',
                    attrs: { 'aria-label': localeTextFunc('firstPage', 'First Page') },
                },
                {
                    tag: 'div',
                    ref: 'btPrevious',
                    cls: 'ag-button ag-paging-button',
                    role: 'button',
                    attrs: { 'aria-label': localeTextFunc('previousPage', 'Previous Page') },
                },
                {
                    tag: 'span',
                    cls: 'ag-paging-description',
                    children: [
                        {
                            tag: 'span',
                            attrs: { id: `${idPrefix}-start-page` },
                            children: localeTextFunc('page', 'Page'),
                        },
                        {
                            tag: 'span',
                            ref: 'lbCurrent',
                            cls: 'ag-paging-number',
                            attrs: { id: `${idPrefix}-start-page-number` },
                        },
                        {
                            tag: 'span',
                            attrs: { id: `${idPrefix}-of-page` },
                            children: localeTextFunc('of', 'of'),
                        },
                        {
                            tag: 'span',
                            ref: 'lbTotal',
                            cls: 'ag-paging-number',
                            attrs: { id: `${idPrefix}-of-page-number` },
                        },
                    ],
                },
                {
                    tag: 'div',
                    ref: 'btNext',
                    cls: 'ag-button ag-paging-button',
                    role: 'button',
                    attrs: { 'aria-label': localeTextFunc('nextPage', 'Next Page') },
                },
                {
                    tag: 'div',
                    ref: 'btLast',
                    cls: 'ag-button ag-paging-button',
                    role: 'button',
                    attrs: { 'aria-label': localeTextFunc('lastPage', 'Last Page') },
                },
            ],
        });

        const { gos, btFirst, btPrevious, btNext, btLast, beans } = this;
        const isRtl = gos.get('enableRtl');

        btFirst.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'last' : 'first', beans)!);
        btPrevious.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'next' : 'previous', beans)!);
        btNext.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'previous' : 'next', beans)!);
        btLast.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'first' : 'last', beans)!);

        this.activateTabIndex([btFirst, btPrevious, btNext, btLast]);

        for (const { el, fn } of [
            { el: btFirst, fn: this.onBtFirst.bind(this) },
            { el: btPrevious, fn: this.onBtPrevious.bind(this) },
            { el: btNext, fn: this.onBtNext.bind(this) },
            { el: btLast, fn: this.onBtLast.bind(this) },
        ]) {
            this.addManagedListeners(el, {
                click: fn,
                keydown: (e: KeyboardEvent) => {
                    if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                        e.preventDefault();
                        fn();
                    }
                },
            });
        }

        this.refresh();
    }

    private onBtFirst(): void {
        if (!this.previousAndFirstButtonsDisabled) {
            this.pagination.goToFirstPage();
        }
    }

    private onBtPrevious(): void {
        if (!this.previousAndFirstButtonsDisabled) {
            this.pagination.goToPreviousPage();
        }
    }

    private onBtNext(): void {
        if (!this.nextButtonDisabled) {
            this.pagination.goToNextPage();
        }
    }

    private onBtLast(): void {
        if (!this.lastButtonDisabled) {
            this.pagination.goToLastPage();
        }
    }

    public refresh(): void {
        this.enableOrDisableButtons();
        this.updateLabels();
    }

    private enableOrDisableButtons(): void {
        const currentPage = this.pagination.getCurrentPage();
        const maxRowFound = this.rowModel.isLastRowIndexKnown();
        const totalPages = this.pagination.getTotalPages();

        this.previousAndFirstButtonsDisabled = currentPage === 0;
        this.toggleButtonDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);

        const zeroPagesToDisplay = maxRowFound && totalPages === 0;
        const onLastPage = currentPage === totalPages - 1;

        this.nextButtonDisabled = onLastPage || zeroPagesToDisplay;
        this.lastButtonDisabled = !maxRowFound || zeroPagesToDisplay || onLastPage;

        this.toggleButtonDisabled(this.btNext, this.nextButtonDisabled);
        this.toggleButtonDisabled(this.btLast, this.lastButtonDisabled);
    }

    private toggleButtonDisabled(button: HTMLElement, disabled: boolean): void {
        _setAriaDisabled(button, disabled);
        button.classList.toggle('ag-disabled', disabled);
    }

    private updateLabels(): void {
        const { rowModel, pagination } = this;
        const lastPageFound = rowModel.isLastRowIndexKnown();
        const totalPages = pagination.getTotalPages();
        const currentPage = pagination.getCurrentPage();
        const localeTextFunc = this.getLocaleTextFunc();

        const pagesExist = totalPages > 0;
        const lbCurrent = this.formatNumber(pagesExist ? currentPage + 1 : 0);
        this.lbCurrent.textContent = lbCurrent;

        let lbTotal: string;
        if (lastPageFound) {
            lbTotal = this.formatNumber(totalPages);
        } else {
            lbTotal = localeTextFunc('more', 'more');
        }
        this.lbTotal.textContent = lbTotal;

        const strPage = localeTextFunc('page', 'Page');
        const strOf = localeTextFunc('of', 'of');
        this.ariaStatus = `${strPage} ${lbCurrent} ${strOf} ${lbTotal}`;
    }

    private formatNumber(value: number): string {
        return _formatPaginationNumber(value, this.gos, this.getLocaleTextFunc.bind(this));
    }
}
