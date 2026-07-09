import { KeyCode, RefPlaceholder, _getActiveDomElement, _setAriaDisabled } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { IRowModel } from '../interfaces/iRowModel';
import { _createElement } from '../utils/element';
import { _createIconNoSpan } from '../utils/icon';
import { Component } from '../widgets/component';
import { _getPageNumberItems } from './pageNumberItems';
import pageNumbersCompCSS from './pageNumbersComp.css';
import type { PaginationService } from './paginationService';
import { _formatPaginationNumber } from './paginationUtils';

const PAGE_ATTR = 'data-page';

export class PageNumbersComp extends Component {
    private rowModel: IRowModel;
    private pagination: PaginationService;

    private readonly eNumbers: HTMLElement = RefPlaceholder;
    private readonly btFirst: HTMLElement = RefPlaceholder;
    private readonly btPrevious: HTMLElement = RefPlaceholder;
    private readonly btNext: HTMLElement = RefPlaceholder;
    private readonly btLast: HTMLElement = RefPlaceholder;

    private previousAndFirstButtonsDisabled = false;
    private nextButtonDisabled = false;
    private lastButtonDisabled = false;

    public ariaStatus = '';

    private readonly idPrefix: string;

    constructor(idPrefix: string) {
        super();
        this.idPrefix = idPrefix;
        this.registerCSS(pageNumbersCompCSS);
    }

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.pagination = beans.pagination!;
    }

    public postConstruct(): void {
        const localeTextFunc = this.getLocaleTextFunc();
        const navButton = (ref: string, labelKey: string, labelDefault: string) =>
            ({
                tag: 'div',
                ref,
                cls: 'ag-button ag-paging-button',
                role: 'button',
                attrs: { 'aria-label': localeTextFunc(labelKey, labelDefault) },
            }) as const;

        this.setTemplate({
            tag: 'div',
            cls: 'ag-paging-page-numbers-panel',
            children: [
                navButton('btFirst', 'firstPage', 'First Page'),
                navButton('btPrevious', 'previousPage', 'Previous Page'),
                { tag: 'div', ref: 'eNumbers', cls: 'ag-paging-page-numbers' },
                navButton('btNext', 'nextPage', 'Next Page'),
                navButton('btLast', 'lastPage', 'Last Page'),
            ],
        });

        const isRtl = this.gos.get('enableRtl');
        this.btFirst.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'last' : 'first', this.beans)!);
        this.btPrevious.insertAdjacentElement(
            'afterbegin',
            _createIconNoSpan(isRtl ? 'next' : 'previous', this.beans)!
        );
        this.btNext.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'previous' : 'next', this.beans)!);
        this.btLast.insertAdjacentElement('afterbegin', _createIconNoSpan(isRtl ? 'first' : 'last', this.beans)!);

        this.initNavButton(this.btFirst, () => this.onBtFirst());
        this.initNavButton(this.btPrevious, () => this.onBtPrevious());
        this.initNavButton(this.btNext, () => this.onBtNext());
        this.initNavButton(this.btLast, () => this.onBtLast());

        this.addManagedListeners(this.eNumbers, {
            click: (e: MouseEvent) => this.onPageActivated(e.target as HTMLElement | null),
            keydown: (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                    e.preventDefault();
                    this.onPageActivated(e.target as HTMLElement | null);
                }
            },
        });

        this.refresh();
    }

    private initNavButton(button: HTMLElement, action: () => void): void {
        this.activateTabIndex([button]);
        this.addManagedListeners(button, {
            click: action,
            keydown: (e: KeyboardEvent) => {
                if (e.key === KeyCode.ENTER || e.key === KeyCode.SPACE) {
                    e.preventDefault();
                    action();
                }
            },
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

    private onPageActivated(target: HTMLElement | null): void {
        const button = target?.closest<HTMLElement>(`[${PAGE_ATTR}]`);
        if (!button) {
            return;
        }
        const page = Number(button.getAttribute(PAGE_ATTR));
        if (Number.isInteger(page)) {
            this.pagination.goToPage(page);
        }
    }

    public refresh(): void {
        const pagination = this.pagination;
        const currentPage = pagination.getCurrentPage();
        const totalPages = pagination.getTotalPages();
        const localeTextFunc = this.getLocaleTextFunc();
        const items = _getPageNumberItems(currentPage, totalPages, this.rowModel.isLastRowIndexKnown());
        const { eNumbers } = this;

        // Rebuilding the numbers drops the focused button; move focus to the rebuilt current page so it isn't lost.
        const restoreFocus = eNumbers.contains(_getActiveDomElement(this.beans));

        eNumbers.replaceChildren();

        const pageLabel = localeTextFunc('page', 'Page');
        let eCurrentPage: HTMLElement | undefined;
        for (let i = 0, len = items.length; i < len; ++i) {
            const item = items[i];
            if (item === 'ellipsis') {
                eNumbers.appendChild(this.createEllipsis(i));
            } else if (item === currentPage + 1) {
                eCurrentPage = this.createCurrentPage(item, pageLabel);
                eNumbers.appendChild(eCurrentPage);
            } else {
                eNumbers.appendChild(this.createPageButton(item, pageLabel));
            }
        }

        if (restoreFocus) {
            eCurrentPage?.focus();
        }

        this.updateArrows(currentPage, totalPages);

        const ofLabel = localeTextFunc('of', 'of');
        const currentLabel = this.formatNumber(totalPages > 0 ? currentPage + 1 : 1);
        const totalLabel = this.formatNumber(Math.max(totalPages, 1));
        this.ariaStatus = `${pageLabel} ${currentLabel} ${ofLabel} ${totalLabel}`;
    }

    private updateArrows(currentPage: number, totalPages: number): void {
        const maxRowFound = this.rowModel.isLastRowIndexKnown();
        const zeroPages = maxRowFound && totalPages === 0;
        const onLastPage = currentPage === totalPages - 1;

        this.previousAndFirstButtonsDisabled = currentPage === 0 || zeroPages;
        this.nextButtonDisabled = onLastPage || zeroPages;
        this.lastButtonDisabled = !maxRowFound || zeroPages || onLastPage;

        this.toggleButtonDisabled(this.btFirst, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btPrevious, this.previousAndFirstButtonsDisabled);
        this.toggleButtonDisabled(this.btNext, this.nextButtonDisabled);
        this.toggleButtonDisabled(this.btLast, this.lastButtonDisabled);
    }

    private toggleButtonDisabled(button: HTMLElement, disabled: boolean): void {
        _setAriaDisabled(button, disabled);
        button.classList.toggle('ag-disabled', disabled);
    }

    private createPageButton(page: number, pageLabel: string): HTMLElement {
        const button = _createElement({
            tag: 'div',
            cls: 'ag-paging-page-number',
            role: 'button',
            attrs: { [PAGE_ATTR]: String(page - 1), 'aria-label': `${pageLabel} ${page}` },
        });
        button.textContent = this.formatNumber(page);
        this.activateTabIndex([button]);
        return button;
    }

    // Current page stays in the tab order as a disabled button so screen readers announce it as an
    // unavailable page; it carries no data-page attr, so activating it never triggers navigation.
    private createCurrentPage(page: number, pageLabel: string): HTMLElement {
        const current = _createElement({
            tag: 'div',
            cls: 'ag-paging-page-number ag-paging-page-number-current',
            role: 'button',
            attrs: { 'aria-current': 'page', 'aria-disabled': 'true', 'aria-label': `${pageLabel} ${page}` },
        });
        current.textContent = this.formatNumber(page);
        this.activateTabIndex([current]);
        return current;
    }

    private createEllipsis(index: number): HTMLElement {
        const ellipsis = _createElement({
            tag: 'span',
            cls: 'ag-paging-page-number-ellipsis',
            attrs: { id: `${this.idPrefix}-page-ellipsis-${index}`, 'aria-hidden': 'true' },
        });
        ellipsis.textContent = '…';
        return ellipsis;
    }

    private formatNumber(value: number): string {
        return _formatPaginationNumber(value, this.gos, this.getLocaleTextFunc.bind(this));
    }
}
