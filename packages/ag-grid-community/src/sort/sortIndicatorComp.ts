import type { ITooltipFeature } from 'ag-stack';
import { RefPlaceholder, _clearElement, _setDisplayed } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import { _getDisplaySortForColumn } from '../entities/agColumn';
import type { SortDef } from '../interfaces/iSort';
import type { TooltipLocation } from '../tooltip/tooltipComponent';
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
        makeIconParams('Asc', 'ascending-icon'),
        makeIconParams('Desc', 'descending-icon'),
        makeIconParams('Mixed', 'mixed-icon'),
        makeIconParams('AbsoluteAsc', 'absolute-ascending-icon'),
        makeIconParams('AbsoluteDesc', 'absolute-descending-icon'),
        makeIconParams('None', 'none-icon'),
        // the sort index sits on the far side of the sort icon from the header text
        makeIconParams('Order', 'order'),
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
    private sortTooltips?: ITooltipFeature[];
    private tooltipIcon?: HTMLElement;

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
        getSortDefOverride?: () => SortDef | null | undefined,
        tooltipLocation: TooltipLocation = 'header'
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
        const sortUpdated = this.updateSort.bind(this);
        this.addManagedEventListeners({
            newColumnsLoaded: updateIcons,
            // Watch global events, as row group columns can effect their display column.
            sortChanged: sortUpdated,
            // when grouping changes so can sort indexes and icons
            columnRowGroupChanged: sortUpdated,
        });

        this.updateSort();
        this.setupSortTooltips(tooltipLocation);
    }

    private setupSortTooltips(location: TooltipLocation): void {
        const eGui = this.getGui();
        const elements = eGui ? [eGui] : [this.eSortAsc, this.eSortDesc, this.eSortAbsoluteAsc, this.eSortAbsoluteDesc];
        for (const element of elements) {
            if (!element) {
                continue;
            }
            const tooltip = this.addTooltip({
                control: 'sort',
                getGui: () => element,
                getLocation: () => location,
                getTooltip: () => {
                    const icon = this.tooltipIcon;
                    let value: string | undefined;
                    if (icon && (element === eGui || element === icon)) {
                        const ascending = icon === this.eSortAsc || icon === this.eSortAbsoluteAsc;
                        value = ascending
                            ? this.getLocaleTextFunc()('tooltipSortedAscending', 'Sorted ascending')
                            : this.getLocaleTextFunc()('tooltipSortedDescending', 'Sorted descending');
                    }
                    return { value, params: { column: this.column } };
                },
            });
            if (tooltip) {
                this.sortTooltips ??= [];
                this.sortTooltips.push(tooltip);
            }
        }
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

    private updateSort(): void {
        this.updateIcons();
        if (!this.suppressOrder) {
            this.updateSortOrder();
        }
    }

    private updateIcons(): void {
        const { eSortAsc, eSortDesc, eSortAbsoluteAsc, eSortAbsoluteDesc, eSortNone, column, beans } = this;

        const { isAbsoluteSort, isDefaultSort, isAscending, isDescending, direction } = _getDisplaySortForColumn(
            column,
            beans,
            this.getSortDefOverride
        );

        if (eSortAsc) {
            _setDisplayed(eSortAsc, isAscending && isDefaultSort, { skipAriaHidden: true });
        }

        if (eSortDesc) {
            _setDisplayed(eSortDesc, isDescending && isDefaultSort, { skipAriaHidden: true });
        }

        if (eSortNone) {
            const alwaysHideNoSort = !column.colDef.unSortIcon;
            _setDisplayed(eSortNone, !alwaysHideNoSort && !direction, { skipAriaHidden: true });
        }

        if (eSortAbsoluteAsc) {
            _setDisplayed(eSortAbsoluteAsc, isAscending && isAbsoluteSort, { skipAriaHidden: true });
        }

        if (eSortAbsoluteDesc) {
            _setDisplayed(eSortAbsoluteDesc, isDescending && isAbsoluteSort, { skipAriaHidden: true });
        }

        let tooltipIcon: HTMLElement | undefined;
        if (isAscending) {
            tooltipIcon = isAbsoluteSort ? eSortAbsoluteAsc : eSortAsc;
        } else if (isDescending) {
            tooltipIcon = isAbsoluteSort ? eSortAbsoluteDesc : eSortDesc;
        }
        if (this.tooltipIcon !== tooltipIcon) {
            this.tooltipIcon = tooltipIcon;
            for (const tooltip of this.sortTooltips ?? []) {
                tooltip.attemptToHideTooltip();
                tooltip.refreshTooltip();
            }
        }
    }

    private setupMultiSortIndicator() {
        const { eSortMixed, column } = this;
        this.addInIcon('sortUnSort', eSortMixed, column);
        // whether its groups' sorts mix follows the coupling, which can change while the column lives
        if (column.showRowGroup) {
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
        this.updateSort();
        if (this.column.showRowGroup) {
            this.updateMultiSortIndicator();
        }
    }
}

export const SortIndicatorSelector: ComponentSelector = {
    selector: 'AG-SORT-INDICATOR',
    component: SortIndicatorComp,
};
