import { RefPlaceholder, _clearElement, _setDisplayed } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import { _getDisplaySortForColumn } from '../entities/agColumn';
import { _isColumnsSortingCoupledToGroup } from '../gridOptionsUtils';
import type { SortDef } from '../interfaces/iSort';
import type { ElementParams } from '../utils/element';
import type { IconName } from '../utils/icon';
import { _createIconNoSpan } from '../utils/icon';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';

const makeIconParams = (dataRefSuffix: string, classSuffix: string): ElementParams => ({
    tag: 'span',
    ref: `eSort${dataRefSuffix}`,
    cls: `ag-sort-indicator-icon ag-sort-${classSuffix} ag-hidden`,
    attrs: { 'aria-hidden': 'true' },
});
const SortIndicatorElement: ElementParams = {
    tag: 'span',
    cls: 'ag-sort-indicator-container',
    children: [
        makeIconParams('Order', 'order'),
        makeIconParams('Asc', 'ascending-icon'),
        makeIconParams('Desc', 'descending-icon'),
        makeIconParams('Mixed', 'mixed-icon'),
        makeIconParams('AbsoluteAsc', 'absolute-ascending-icon'),
        makeIconParams('AbsoluteDesc', 'absolute-descending-icon'),
        makeIconParams('None', 'none-icon'),
    ],
};

export class SortIndicatorComp extends Component {
    // Elements might by undefined when the user provides a custom template
    private eSortOrder?: HTMLElement = RefPlaceholder;
    private eSortAsc?: HTMLElement = RefPlaceholder;
    private eSortDesc?: HTMLElement = RefPlaceholder;
    private eSortMixed?: HTMLElement = RefPlaceholder;
    private eSortNone?: HTMLElement = RefPlaceholder;
    private eSortAbsoluteAsc?: HTMLElement = RefPlaceholder;
    private eSortAbsoluteDesc?: HTMLElement = RefPlaceholder;
    private column: AgColumn;
    private suppressOrder: boolean;
    private getSortDefOverride?: () => SortDef | null | undefined;

    constructor(skipTemplate?: boolean) {
        super();

        if (!skipTemplate) {
            this.setTemplate(SortIndicatorElement);
        }
    }

    public attachCustomElements(
        eSortOrder: HTMLElement | undefined,
        eSortAsc: HTMLElement | undefined,
        eSortDesc: HTMLElement | undefined,
        eSortMixed: HTMLElement | undefined,
        eSortNone: HTMLElement | undefined,
        eSortAbsoluteAsc: HTMLElement | undefined,
        eSortAbsoluteDesc: HTMLElement | undefined
    ) {
        this.eSortOrder = eSortOrder;
        this.eSortAsc = eSortAsc;
        this.eSortDesc = eSortDesc;
        this.eSortMixed = eSortMixed;
        this.eSortNone = eSortNone;
        this.eSortAbsoluteAsc = eSortAbsoluteAsc;
        this.eSortAbsoluteDesc = eSortAbsoluteDesc;
    }

    public setupSort(
        column: AgColumn,
        suppressOrder: boolean = false,
        getSortDefOverride?: () => SortDef | null | undefined
    ): void {
        this.column = column;
        this.suppressOrder = suppressOrder;
        this.getSortDefOverride = getSortDefOverride;

        this.setupMultiSortIndicator();

        if (!column.isSortable() && !column.showRowGroup) {
            return;
        }

        this.addInIcon('sortAscending', this.eSortAsc, column);
        this.addInIcon('sortDescending', this.eSortDesc, column);
        this.addInIcon('sortUnSort', this.eSortNone, column);
        this.addInIcon('sortAbsoluteAscending', this.eSortAbsoluteAsc, column);
        this.addInIcon('sortAbsoluteDescending', this.eSortAbsoluteDesc, column);

        const updateIcons = this.updateIcons.bind(this);
        const sortUpdated = this.onSortChanged.bind(this);
        this.addManagedPropertyListener('unSortIcon', updateIcons);
        this.addManagedEventListeners({
            newColumnsLoaded: updateIcons,
            // Watch global events, as row group columns can effect their display column.
            sortChanged: sortUpdated,
            // when grouping changes so can sort indexes and icons
            columnRowGroupChanged: sortUpdated,
        });

        this.onSortChanged();
    }

    private addInIcon(iconName: IconName, eParent: HTMLElement | undefined, column: AgColumn): void {
        if (eParent == null) {
            return;
        }

        const eIcon = _createIconNoSpan(iconName, this.beans, column);
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
        const { eSortAsc, eSortDesc, eSortAbsoluteAsc, eSortAbsoluteDesc, eSortNone, column, gos, beans } = this;

        const displaySort = _getDisplaySortForColumn(column, beans, this.getSortDefOverride);
        const isDefaultSortAllowed = displaySort.isDefaultSortAllowed;
        const isAbsoluteSortAllowed = displaySort.isAbsoluteSortAllowed;
        const { isAbsoluteSort, isDefaultSort, isAscending, isDescending, direction } = displaySort;

        if (eSortAsc) {
            _setDisplayed(eSortAsc, isAscending && isDefaultSort && isDefaultSortAllowed, { skipAriaHidden: true });
        }

        if (eSortDesc) {
            _setDisplayed(eSortDesc, isDescending && isDefaultSort && isDefaultSortAllowed, { skipAriaHidden: true });
        }

        if (eSortNone) {
            const alwaysHideNoSort = !column.colDef.unSortIcon && !gos.get('unSortIcon');
            _setDisplayed(eSortNone, !alwaysHideNoSort && !direction, { skipAriaHidden: true });
        }

        if (eSortAbsoluteAsc) {
            _setDisplayed(eSortAbsoluteAsc, isAscending && isAbsoluteSort && isAbsoluteSortAllowed, {
                skipAriaHidden: true,
            });
        }

        if (eSortAbsoluteDesc) {
            _setDisplayed(eSortAbsoluteDesc, isDescending && isAbsoluteSort && isAbsoluteSortAllowed, {
                skipAriaHidden: true,
            });
        }
    }

    private setupMultiSortIndicator() {
        const { eSortMixed, column, gos } = this;
        this.addInIcon('sortUnSort', eSortMixed, column);

        const isColumnShowingRowGroup = column.showRowGroup;
        const areGroupsCoupled = _isColumnsSortingCoupledToGroup(gos);
        if (areGroupsCoupled && isColumnShowingRowGroup) {
            this.addManagedEventListeners({
                // Watch global events, as row group columns can effect their display column.
                sortChanged: this.updateMultiSortIndicator.bind(this),
                // when grouping changes so can sort indexes and icons
                columnRowGroupChanged: this.updateMultiSortIndicator.bind(this),
            });
            this.updateMultiSortIndicator();
        }
    }

    private updateMultiSortIndicator() {
        const { eSortMixed, beans, column } = this;
        if (eSortMixed) {
            const isMixedSort = beans.sortSvc!.getDisplaySort(column)?.direction === 'mixed';
            _setDisplayed(eSortMixed, isMixedSort, { skipAriaHidden: true });
        }
    }

    // we listen here for global sort events, NOT column sort events, as we want to do this
    // when sorting has been set on all column (if we listened just for our col (where we
    // set the asc / desc icons) then it's possible other cols are yet to get their sorting state.
    private updateSortOrder(): void {
        const {
            eSortOrder,
            column,
            beans: { sortSvc },
        } = this;
        if (!eSortOrder) {
            return;
        }

        const indexThisCol = sortSvc!.getDisplaySortIndex(column) ?? -1;
        const showIndex = indexThisCol >= 0 && sortSvc!.isMultiSort();
        _setDisplayed(eSortOrder, showIndex, { skipAriaHidden: true });

        if (indexThisCol >= 0) {
            eSortOrder.textContent = (indexThisCol + 1).toString();
        } else {
            _clearElement(eSortOrder);
        }
    }

    public refresh(): void {
        this.onSortChanged();
    }
}

export const SortIndicatorSelector: ComponentSelector = {
    selector: 'AG-SORT-INDICATOR',
    component: SortIndicatorComp,
};
