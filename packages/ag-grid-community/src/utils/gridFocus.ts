import { KeyCode } from '../agStack/constants/keyCode';
import { _isNothingFocused } from '../agStack/utils/document';
import { _findFocusableElements, _findNextFocusableElement, _isKeyboardMode } from '../agStack/utils/focus';
import type { BeanCollection } from '../context/context';
import { _areCellsEqual } from '../entities/positionUtils';
import type { TabToNextGridContainerTarget } from '../interfaces/iCallbackParams';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { FocusableContainer } from '../interfaces/iFocusableContainer';
import type { Component } from '../widgets/component';
import { _isStopPropagationForAgGrid } from './gridEvent';

export function _addFocusableContainerListener(beans: BeanCollection, comp: Component, eGui: HTMLElement): void {
    comp.addManagedElementListeners(eGui, {
        keydown: (e: KeyboardEvent) => {
            if (!e.defaultPrevented && !_isStopPropagationForAgGrid(e) && e.key === KeyCode.TAB) {
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

export function _focusGridInnerElement(beans: BeanCollection, fromBottom?: boolean): boolean {
    return beans.ctrlsSvc.get('gridCtrl').focusInnerElement(fromBottom);
}

export function _isHeaderFocusSuppressed(beans: BeanCollection): boolean {
    return beans.gos.get('suppressHeaderFocus') || !!beans.overlays?.exclusive;
}

export function _isCellFocusSuppressed(beans: BeanCollection): boolean {
    return beans.gos.get('suppressCellFocus') || !!beans.overlays?.exclusive;
}

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
