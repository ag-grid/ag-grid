import { KeyCode } from '../agStack/constants/keyCode';
import { _findNextFocusableElement } from '../agStack/utils/focus';
import type { BeanCollection } from '../context/context';
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
    return beans.gos.get('suppressHeaderFocus') || !!beans.overlays?.isExclusive();
}

export function _isCellFocusSuppressed(beans: BeanCollection): boolean {
    return beans.gos.get('suppressCellFocus') || !!beans.overlays?.isExclusive();
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
