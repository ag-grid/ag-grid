import type { LocaleTextFunc } from 'ag-stack';

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
    void filterManager.setColumnFilterModel(column, null).then(() => {
        if (!filterManager.isAlive()) {
            return;
        }
        filterManager.onFilterChanged({ columns: [column], source: 'columnFilter' });
    });
}

/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 * A pointer click on a read-only input inside `eContainer` opens the filter popup, as the filter button does.
 * Keyboard users still Tab into the input.
 */
export function _openFilterOnReadOnlyInputClick(
    comp: Component,
    eContainer: HTMLElement,
    showParentFilter: () => void
): void {
    const isReadOnlyInput = (target: EventTarget | null): boolean => {
        const element = target as HTMLInputElement | null;
        return element?.tagName === 'INPUT' && element.readOnly;
    };
    comp.addManagedListeners(eContainer, {
        // Stops the browser focusing the input on mouse-down, which would flash its focus style before the popup opens.
        mousedown: (event: MouseEvent) => {
            if (isReadOnlyInput(event.target)) {
                event.preventDefault();
            }
        },
        click: (event: MouseEvent) => {
            if (isReadOnlyInput(event.target)) {
                showParentFilter();
            }
        },
    });
}
