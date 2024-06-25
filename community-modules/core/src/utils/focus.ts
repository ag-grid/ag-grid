import { KeyCode } from '../constants/keyCode';
import type { FocusService } from '../focusService';
import type { GridOptionsService } from '../gridOptionsService';
import type { Component } from '../widgets/component';

export function _addFocusableContainerListener(comp: Component, eGui: HTMLElement, focusService: FocusService): void {
    comp.addManagedElementListeners(eGui, {
        keydown: (e: KeyboardEvent) => {
            if (e.key === KeyCode.TAB) {
                const backwards = e.shiftKey;
                if (!focusService.findNextFocusableElement(eGui, false, backwards)) {
                    if (focusService.focusNextGridCoreContainer(backwards)) {
                        e.preventDefault();
                    }
                }
            }
        },
    });
}

export function _findNextElementOutsideAndFocus(
    up: boolean,
    gos: GridOptionsService,
    focusService: FocusService,
    lastElement: HTMLElement
): void {
    const eDocument = gos.getDocument();
    const focusableEls = focusService.findFocusableElements(eDocument.body, null, true);
    const index = focusableEls.indexOf(lastElement);

    if (index === -1) {
        return;
    }

    let start: number;
    let end: number;
    if (up) {
        start = 0;
        end = index;
    } else {
        start = index + 1;
        end = focusableEls.length;
    }
    const focusableRange = focusableEls.slice(start, end);
    const targetTabIndex = gos.get('tabIndex');
    focusableRange.sort((a: HTMLElement, b: HTMLElement) => {
        const indexA = parseInt(a.getAttribute('tabindex') || '0');
        const indexB = parseInt(b.getAttribute('tabindex') || '0');

        if (indexB === targetTabIndex) {
            return 1;
        }
        if (indexA === targetTabIndex) {
            return -1;
        }

        if (indexA === 0) {
            return 1;
        }
        if (indexB === 0) {
            return -1;
        }

        return indexA - indexB;
    });

    focusableRange[up ? focusableRange.length - 1 : 0].focus();
}
