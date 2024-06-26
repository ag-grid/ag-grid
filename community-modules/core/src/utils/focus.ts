import { KeyCode } from '../constants/keyCode';
import type { FocusService } from '../focusService';
import type { Component } from '../widgets/component';

export function _addFocusableContainerListener(comp: Component, eGui: HTMLElement, focusService: FocusService): void {
    comp.addManagedElementListeners(eGui, {
        keydown: (e: KeyboardEvent) => {
            if (!e.defaultPrevented && e.key === KeyCode.TAB) {
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
