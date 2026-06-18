import {
    KeyCode,
    _findFocusableElements,
    _findNextFocusableElement,
    _isKeyboardMode,
    _isNothingFocused,
} from 'ag-stack';

import type { BeanCollection } from '../context/context';
import { _areCellsEqual } from '../entities/positionUtils';
import type { TabToNextGridContainerTarget } from '../interfaces/iCallbackParams';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { Component } from '../widgets/component';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _addFocusableContainerListener(beans: BeanCollection, comp: Component, eGui: HTMLElement): void {
    comp.addManagedElementListeners(eGui, {
        keydown: (e: KeyboardEvent) => {
            // some managed containers handle tab themselves and only need to suppress
            // this generic fallback for the current event.
            if (!e.defaultPrevented && !_shouldSkipFocusableContainerListener(e) && e.key === KeyCode.TAB) {
                const backwards = e.shiftKey;
                if (!_findNextFocusableElement(beans, eGui, false, backwards)) {
                    if (_focusNextGridCoreContainer(beans, backwards)) {
                        e.preventDefault();
                    }
                }
            }
        },
    });
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _focusGridInnerElement(beans: BeanCollection, fromBottom?: boolean): boolean {
    return beans.ctrlsSvc.get('gridCtrl').focusInnerElement(fromBottom);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isHeaderFocusSuppressed(beans: BeanCollection): boolean {
    return beans.gos.get('suppressHeaderFocus') || !!beans.overlays?.exclusive;
}

export function _isCellFocusSuppressed(beans: BeanCollection): boolean {
    return beans.gos.get('suppressCellFocus') || !!beans.overlays?.exclusive;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _focusNextGridCoreContainer(
    beans: BeanCollection,
    backwards: boolean,
    forceOut: boolean = false
): boolean {
    const gridCtrl = beans.ctrlsSvc.get('gridCtrl');
    const focusResult = gridCtrl.focusNextInnerContainer(backwards);

    if (focusResult === true) {
        return true;
    }

    // false from tabToNextGridContainer means browser-default tab flow.
    if (focusResult === false) {
        return focusResult;
    }

    if (forceOut || (!backwards && !gridCtrl.isDetailGrid() && gridCtrl.isFocusInsideGridBody())) {
        gridCtrl.forceFocusOutOfContainer(backwards);
    }

    return false;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _attemptToRestoreCellFocus(beans: BeanCollection, focusedCell: CellPosition | null): void {
    const focusSvc = beans.focusSvc;
    const currentFocusedCell = focusSvc.getFocusedCell();

    if (currentFocusedCell && focusedCell && _areCellsEqual(currentFocusedCell, focusedCell)) {
        const { rowIndex, rowPinned, column } = focusedCell;

        if (_isNothingFocused(beans)) {
            focusSvc.setFocusedCell({
                rowIndex,
                column,
                rowPinned,
                forceBrowserFocus: true,
                preventScrollOnBrowserFocus: !_isKeyboardMode(),
            });
        }
    }
}

export function _getDefaultTabTargetForContainer(
    container: FocusableContainer,
    getGridBodyTabTarget: () => TabToNextGridContainerTarget | null
): TabToNextGridContainerTarget | null {
    const containerName = container.getFocusableContainerName();

    // when moving into the grid body, default focus should land on a real grid target.
    if (containerName === 'gridBody') {
        return getGridBodyTabTarget();
    }

    return _runWithContainerFocusAllowed(
        container,
        () => _findFocusableElements(container.getGui(), '.ag-tab-guard').length > 0
    )
        ? containerName
        : null;
}

export function _runWithContainerFocusAllowed<T>(container: FocusableContainer, callback: () => T): T {
    container.setAllowFocus?.(true);
    try {
        return callback();
    } finally {
        container.setAllowFocus?.(false);
    }
}

const AG_GRID_SKIP_FOCUSABLE_CONTAINER = '__ag_Grid_Skip_Focusable_Container';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _skipFocusableContainerListenerForAgGrid(event: Event): void {
    // this is narrower than _stopPropagationForAgGrid:
    // it only skips _addFocusableContainerListener for this event, so other ag grid
    // keyboard handling can continue to run normally.
    (event as any)[AG_GRID_SKIP_FOCUSABLE_CONTAINER] = true;
}

function _shouldSkipFocusableContainerListener(event: Event): boolean {
    return (event as any)[AG_GRID_SKIP_FOCUSABLE_CONTAINER] === true;
}
