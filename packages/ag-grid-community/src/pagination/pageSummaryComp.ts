import type { AgElementParams, LocaleTextFunc } from 'ag-stack';
import { KeyCode, RefPlaceholder, _setAriaDisabled, _setAriaLabel, _setAriaRole } from 'ag-stack';

import { AgInputNumberFieldSelector } from '../agWidgets/agInputNumberField';
import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import { _createIconNoSpan } from '../utils/icon';
import type { AgComponentSelectorType } from '../widgets/component';
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
        const localeTextFunc = this.getLocaleTextFunc();
        this.setTemplate(
            buildPageSummaryTemplate(this.idPrefix, this.suppressPageInput, localeTextFunc),
            this.suppressPageInput ? [] : [AgInputNumberFieldSelector]
        );
        insertNavIcons(this.gos.get('enableRtl'), this.beans, this.btFirst, this.btPrevious, this.btNext, this.btLast);
        this.initNavButtons();
        if (!this.suppressPageInput) {
            this.initPageInput();
        }
        this.refresh();
    }

    private initNavButtons(): void {
        const { btFirst, btPrevious, btNext, btLast } = this;
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
    }

    private initPageInput(): void {
        const { lbCurrentInput, pagination } = this;
        const eInput = lbCurrentInput.getInputElement();
        _setAriaRole(eInput, 'spinbutton');
        this.addManagedListeners(eInput, {
            keydown: (e: KeyboardEvent) => {
                const { key } = e;
                if (key !== KeyCode.ENTER && key !== KeyCode.ESCAPE && key !== KeyCode.UP && key !== KeyCode.DOWN) {
                    return;
                }
                e.preventDefault();
                let targetPage: number | null = null;
                const current = pagination.getCurrentPage();
                const maxPage = pagination.getTotalPages();
                switch (key) {
                    case KeyCode.ENTER:
                        this.commitPageInput();
                        break;
                    case KeyCode.ESCAPE:
                        lbCurrentInput.setValue(String(current + 1), true); // needs to happen before blur below
                        eInput.blur();
                        break;
                    case KeyCode.UP:
                        if (current + 2 <= maxPage) {
                            targetPage = current + 2;
                        }
                        break;
                    case KeyCode.DOWN:
                        if (current !== 0) {
                            targetPage = current;
                        }
                        break;
                }
                if (targetPage !== null) {
                    lbCurrentInput.setValue(String(targetPage), true);
                    this.commitPageInput();
                }
            },
            blur: () => this.commitPageInput(),
        });
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

    private commitPageInput(): void {
        const { pagination, lbCurrentInput } = this;
        const currentPage = pagination.getCurrentPage() + 1;
        const rawValue = lbCurrentInput.getValue(true);
        if (!rawValue?.trim()) {
            lbCurrentInput.setValue(String(currentPage), true);
            return;
        }
        const rawValueNum = Number(rawValue);
        const total = pagination.getTotalPages();
        const isValid =
            Number.isFinite(rawValueNum) && Number.isInteger(rawValueNum) && rawValueNum >= 1 && rawValueNum <= total;
        if (!isValid) {
            lbCurrentInput.setValue(String(currentPage), true);
            return;
        }
        pagination.goToPage(rawValueNum - 1);
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
            // Before data loads totalPages is 0; clamp to 1 to avoid an invalid input while data loads
            const pageCount = Math.max(1, totalPages);
            lbCurrentInput.setMin(1);
            lbCurrentInput.setMax(pageCount);
            // log10 returns number of digits (as an integer part + fraction) - 1,
            // bump that to 1 + 1x2 each side pad + 0.5 for borders and css oddities
            lbCurrentInput.getInputElement().style.width = `${Math.floor(Math.log10(pageCount)) + 3.5}ch`;
            lbCurrentInput.setValue(lbCurrentValue.toString());
            const eInput = lbCurrentInput.getInputElement();
            _setAriaLabel(
                eInput,
                `${localeTextFunc('page', 'Page')} ${localeTextFunc('number', 'number')}, ${lbCurrentValue} ${localeTextFunc('of', 'of')} ${lbTotalStr}`
            );
            eInput.setAttribute('aria-valuenow', String(lbCurrentValue));
            eInput.setAttribute('aria-valuemin', '1');
            eInput.setAttribute('aria-valuemax', String(pageCount));
        }

        const strPage = localeTextFunc('page', 'Page');
        const strOf = localeTextFunc('of', 'of');
        this.ariaStatus = `${strPage} ${lbCurrent} ${strOf} ${lbTotalStr}`;
    }

    private formatNumber(value: number): string {
        return _formatPaginationNumber(value, this.gos, this.getLocaleTextFunc.bind(this));
    }
}

function buildPageSummaryTemplate(
    idPrefix: string,
    noInput: boolean,
    localeTextFunc: LocaleTextFunc
): AgElementParams<AgComponentSelectorType> {
    const pageNumberChild = {
        cls: 'ag-paging-number',
        attrs: { id: `${idPrefix}-start-page-number` },
        tag: noInput ? 'span' : 'ag-input-number-field',
        ref: noInput ? 'lbCurrentStatic' : 'lbCurrentInput',
    } as const;

    return {
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
    };
}

function insertNavIcons(
    isRtl: boolean,
    beans: BeanCollection,
    btFirst: HTMLElement,
    btPrevious: HTMLElement,
    btNext: HTMLElement,
    btLast: HTMLElement
): void {
    btFirst.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'last' : 'first', beans)!);
    btPrevious.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'next' : 'previous', beans)!);
    btNext.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'previous' : 'next', beans)!);
    btLast.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'first' : 'last', beans)!);
}
