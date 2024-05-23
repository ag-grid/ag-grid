import type { BeanCollection } from '../../../context/context';
import type { Column } from '../../../entities/column';
import { Events } from '../../../eventKeys';
import type { SortController } from '../../../sortController';
import { _clearElement, _setDisplayed } from '../../../utils/dom';
import { _createIconNoSpan } from '../../../utils/icon';
import type { AgComponentSelector } from '../../../widgets/component';
import { Component, RefPlaceholder } from '../../../widgets/component';

export class SortIndicatorComp extends Component {
    private sortController: SortController;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.sortController = beans.sortController;
    }

    static readonly selector: AgComponentSelector = 'AG-SORT-INDICATOR';

    private static TEMPLATE /* html */ = `<span class="ag-sort-indicator-container">
            <span data-ref="eSortOrder" class="ag-sort-indicator-icon ag-sort-order ag-hidden" aria-hidden="true"></span>
            <span data-ref="eSortAsc" class="ag-sort-indicator-icon ag-sort-ascending-icon ag-hidden" aria-hidden="true"></span>
            <span data-ref="eSortDesc" class="ag-sort-indicator-icon ag-sort-descending-icon ag-hidden" aria-hidden="true"></span>
            <span data-ref="eSortMixed" class="ag-sort-indicator-icon ag-sort-mixed-icon ag-hidden" aria-hidden="true"></span>
            <span data-ref="eSortNone" class="ag-sort-indicator-icon ag-sort-none-icon ag-hidden" aria-hidden="true"></span>
        </span>`;

    private eSortOrder: HTMLElement = RefPlaceholder;
    private eSortAsc: HTMLElement = RefPlaceholder;
    private eSortDesc: HTMLElement = RefPlaceholder;
    private eSortMixed: HTMLElement = RefPlaceholder;
    private eSortNone: HTMLElement = RefPlaceholder;

    private column: Column;
    private suppressOrder: boolean;

    constructor(skipTemplate?: boolean) {
        super();

        if (!skipTemplate) {
            this.setTemplate(SortIndicatorComp.TEMPLATE);
        }
    }

    public attachCustomElements(
        eSortOrder: HTMLElement,
        eSortAsc: HTMLElement,
        eSortDesc: HTMLElement,
        eSortMixed: HTMLElement,
        eSortNone: HTMLElement
    ) {
        this.eSortOrder = eSortOrder;
        this.eSortAsc = eSortAsc;
        this.eSortDesc = eSortDesc;
        this.eSortMixed = eSortMixed;
        this.eSortNone = eSortNone;
    }

    public setupSort(column: Column, suppressOrder: boolean = false): void {
        this.column = column;
        this.suppressOrder = suppressOrder;

        this.setupMultiSortIndicator();

        if (!this.column.isSortable() && !this.column.getColDef().showRowGroup) {
            return;
        }

        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);

        this.addManagedPropertyListener('unSortIcon', () => this.updateIcons());
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.updateIcons());

        // Watch global events, as row group columns can effect their display column.
        this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () => this.onSortChanged());
        // when grouping changes so can sort indexes and icons
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () => this.onSortChanged());

        this.onSortChanged();
    }

    private addInIcon(iconName: string, eParent: HTMLElement, column: Column): void {
        if (eParent == null) {
            return;
        }

        const eIcon = _createIconNoSpan(iconName, this.gos, column);
        if (eIcon) {
            eParent.appendChild(eIcon);
        }
    }

    private onSortChanged(): void {
        this.updateIcons();
        if (!this.suppressOrder) {
            this.updateSortOrder();
        }
    }

    private updateIcons(): void {
        const sortDirection = this.sortController.getDisplaySortForColumn(this.column);

        if (this.eSortAsc) {
            const isAscending = sortDirection === 'asc';
            _setDisplayed(this.eSortAsc, isAscending, { skipAriaHidden: true });
        }

        if (this.eSortDesc) {
            const isDescending = sortDirection === 'desc';
            _setDisplayed(this.eSortDesc, isDescending, { skipAriaHidden: true });
        }

        if (this.eSortNone) {
            const alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gos.get('unSortIcon');
            const isNone = sortDirection === null || sortDirection === undefined;
            _setDisplayed(this.eSortNone, !alwaysHideNoSort && isNone, { skipAriaHidden: true });
        }
    }

    private setupMultiSortIndicator() {
        this.addInIcon('sortUnSort', this.eSortMixed, this.column);

        const isColumnShowingRowGroup = this.column.getColDef().showRowGroup;
        const areGroupsCoupled = this.gos.isColumnsSortingCoupledToGroup();
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            // Watch global events, as row group columns can effect their display column.
            this.addManagedListener(this.eventService, Events.EVENT_SORT_CHANGED, () =>
                this.updateMultiSortIndicator()
            );
            // when grouping changes so can sort indexes and icons
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, () =>
                this.updateMultiSortIndicator()
            );
            this.updateMultiSortIndicator();
        }
    }

    private updateMultiSortIndicator() {
        if (this.eSortMixed) {
            const isMixedSort = this.sortController.getDisplaySortForColumn(this.column) === 'mixed';
            _setDisplayed(this.eSortMixed, isMixedSort, { skipAriaHidden: true });
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private updateSortOrder(): void {
        if (!this.eSortOrder) {
            return;
        }

        const allColumnsWithSorting = this.sortController.getColumnsWithSortingOrdered();

        const indexThisCol = this.sortController.getDisplaySortIndexForColumn(this.column) ?? -1;
        const moreThanOneColSorting = allColumnsWithSorting.some(
            (col) => this.sortController.getDisplaySortIndexForColumn(col) ?? -1 >= 1
        );
        const showIndex = indexThisCol >= 0 && moreThanOneColSorting;
        _setDisplayed(this.eSortOrder, showIndex, { skipAriaHidden: true });

        if (indexThisCol >= 0) {
            this.eSortOrder.textContent = (indexThisCol + 1).toString();
        } else {
            _clearElement(this.eSortOrder);
        }
    }
}
