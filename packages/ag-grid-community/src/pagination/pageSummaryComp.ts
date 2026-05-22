import { KeyCode } from '../agStack/constants/keyCode';
import { RefPlaceholder } from '../agStack/interfaces/agComponent';
import { _setAriaDisabled } from '../agStack/utils/aria';
import { AgInputNumberFieldSelector } from '../agStack/widgets/agInputNumberField';
import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import { _createIconNoSpan } from '../utils/icon';
import { Component } from '../widgets/component';
import type { GridInputNumberField } from '../widgets/gridWidgetTypes';
import type { PaginationService } from './paginationService';
import { _formatPaginationNumber } from './paginationUtils';

export class PageSummaryComp extends Component {
    private rowModel: IRowModel;
    private pagination: PaginationService;

    private readonly btFirst: HTMLElement = RefPlaceholder;
    private readonly btPrevious: HTMLElement = RefPlaceholder;
    private readonly btNext: HTMLElement = RefPlaceholder;
    private readonly btLast: HTMLElement = RefPlaceholder;
    private readonly lbCurrentInput: GridInputNumberField = RefPlaceholder;
    private readonly lbCurrentStatic: HTMLElement = RefPlaceholder;
    private readonly lbTotal: HTMLElement = RefPlaceholder;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;

    public ariaStatus = '';
    private readonly idPrefix: string;
    private readonly suppressPageInput: boolean;

    constructor(idPrefix: string, suppressPageInput?: boolean) {
        super();
        this.idPrefix = idPrefix;
        this.suppressPageInput = suppressPageInput ?? false;
    }

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.pagination = beans.pagination!;
    }

    public postConstruct(): void {
        const noInput = this.suppressPageInput;
        const idPrefix = this.idPrefix;
        const localeTextFunc = this.getLocaleTextFunc();
        const pageNumberChild = {
            cls: 'ag-paging-number',
            attrs: { id: `${idPrefix}-start-page-number` },
            tag: noInput ? 'span' : 'ag-input-number-field',
            ref: noInput ? 'lbCurrentStatic' : 'lbCurrentInput',
        } as const;

        this.setTemplate(
            {
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
                            pageNumberChild,
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
            },
            this.suppressPageInput ? [] : [AgInputNumberFieldSelector]
        );

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

        if (!this.suppressPageInput) {
            const { lbCurrentInput } = this;
            lbCurrentInput.onValueChange(this.onInputPage.bind(this));
            this.addManagedListeners(lbCurrentInput.getInputElement(), {
                blur: () => {
                    if (!lbCurrentInput.getInputElement().value.trim()) {
                        lbCurrentInput.setValue(String(this.pagination.getCurrentPage() + 1), true);
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

    private onInputPage(): void {
        const { pagination, lbCurrentInput } = this;
        const rawValue = lbCurrentInput.getValue(true);
        if (!rawValue?.trim()) {
            return;
        }
        const rawValueNum = Number(rawValue);
        let value = Number.isFinite(rawValueNum) ? rawValueNum : pagination.getCurrentPage() + 1;
        const total = pagination.getTotalPages();
        value = Math.max(1, Math.min(value, total));
        if (rawValueNum !== value) {
            lbCurrentInput.setValue(String(value), true);
        }
        pagination.goToPage(value - 1);
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
        const { rowModel, pagination, lbCurrentInput, lbCurrentStatic, lbTotal } = this;
        const lastPageFound = rowModel.isLastRowIndexKnown();
        const totalPages = pagination.getTotalPages();
        const currentPage = pagination.getCurrentPage();
        const localeTextFunc = this.getLocaleTextFunc();

        let lbTotalStr: string;
        if (lastPageFound) {
            lbTotalStr = this.formatNumber(totalPages);
        } else {
            lbTotalStr = localeTextFunc('more', 'more');
        }
        lbTotal.textContent = lbTotalStr;

        const pagesExist = totalPages > 0;
        const lbCurrentValue = pagesExist ? currentPage + 1 : 1;
        const lbCurrent = this.formatNumber(lbCurrentValue);
        if (this.suppressPageInput) {
            lbCurrentStatic.textContent = lbCurrent;
        } else {
            lbCurrentInput.setMin(1);
            lbCurrentInput.setMax(totalPages);
            lbCurrentInput.getInputElement().style.width = `${Math.floor(Math.log10(totalPages) + 3)}ch`; // log10 returns number of digits (as an integer part + fraction) - 1
            lbCurrentInput.setValue(lbCurrentValue.toString());
        }

        const strPage = localeTextFunc('page', 'Page');
        const strOf = localeTextFunc('of', 'of');
        this.ariaStatus = `${strPage} ${lbCurrent} ${strOf} ${lbTotalStr}`;
    }

    private formatNumber(value: number): string {
        return _formatPaginationNumber(value, this.gos, this.getLocaleTextFunc.bind(this));
    }
}
