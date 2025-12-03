import { KeyCode } from '../agStack/constants/keyCode';
import { _isNothingFocused } from '../agStack/utils/document';
import { _findNextFocusableElement, _isKeyboardMode } from '../agStack/utils/focus';
import type { BeanCollection } from '../context/context';
import { _areCellsEqual } from '../entities/positionUtils';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { Component } from '../widgets/component';

export function _addFocusableContainerListener(beans: BeanCollection, comp: Component, eGui: HTMLElement): void {
    comp.addManagedElementListeners(eGui, {
        keydown: (e: KeyboardEvent) => {
            if (!e.defaultPrevented && e.key === KeyCode.TAB) {
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
    if (!forceOut && gridCtrl.focusNextInnerContainer(backwards)) {
        return true;
    }

    if (forceOut || (!backwards && !gridCtrl.isDetailGrid())) {
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
