import type { LocaleTextFunc } from 'ag-stack';
import { _addManagedElementListeners } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { Component } from '../../widgets/component';
import { translateColumnFilterLabel } from '../filterAriaLabels';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getFloatingFilterAriaLabel(
    beans: BeanCollection,
    column: AgColumn,
    translate: LocaleTextFunc
): string {
    return translateColumnFilterLabel(beans, column, translate, 'filterInput');
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _clearFloatingFilterModel(beans: BeanCollection, column: AgColumn): void {
    const filterManager = beans.filterManager;
    if (!filterManager) {
        return;
    }
    void filterManager
        .setColumnFilterModel(column, null)
        .then(() => filterManager.onFilterChanged({ columns: [column], source: 'columnFilter' }));
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addReadOnlyFloatingFilterClick(
    beans: BeanCollection,
    comp: Component,
    showParentFilter: () => void
): void {
    _addManagedElementListeners(comp, comp.getGui(), {
        click: (event: MouseEvent) => {
            const target = event.target as HTMLInputElement;
            if (
                target.tagName !== 'INPUT' ||
                !target.readOnly ||
                beans.gos.get('readOnlyFloatingFilterClickAction') !== 'openPopup'
            ) {
                return;
            }
            showParentFilter();
        },
    });
}
