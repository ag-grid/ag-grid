import type { Group } from '@tweenjs/tween.js';

import type { AgElementFinder } from '../agElements';
import {
    AG_MENU_OPTION_ACTIVE_CLASSNAME,
    AG_MENU_OPTION_DISABLED_CLASSNAME,
    AG_MENU_OPTION_SELECTOR,
} from '../constants';
import type { Mouse } from '../createMouse';
import { findElementWithInnerText } from '../dom';
import type { ScriptDebugger } from '../scriptDebugger';
import type { EasingFunction } from '../tween';
import { clearAllMenuOptionHighlights } from './clearAllMenuOptionHighlights';
import { createMoveMouse } from './createMoveMouse';
import { mouseClick } from './mouseClick';
import { waitFor } from './waitFor';

export interface ClickOnContextMenuItemParams {
    mouse: Mouse;
    getOverlay: () => HTMLElement;
    /**
     * Begin action with a right click on a grid cell
     */
    rightClickOnCell?: {
        colIndex: number;
        rowIndex: number;
    };
    menuItemPath: string[];
    speed?: number;
    duration?: number;
    tweenGroup: Group;
    /**
     * Easing function
     *
     * @see https://createjs.com/docs/tweenjs/classes/Ease.html
     */
    easing?: EasingFunction;
    agElementFinder: AgElementFinder;
    scriptDebugger?: ScriptDebugger;
}

export async function clickOnContextMenuItem({
    mouse,
    getOverlay,
    rightClickOnCell,
    menuItemPath,
    speed,
    duration,
    tweenGroup,
    easing,
    agElementFinder,
    scriptDebugger,
}: ClickOnContextMenuItemParams): Promise<void> {
    if (rightClickOnCell) {
        const { colIndex, rowIndex } = rightClickOnCell;
        await mouseClick({
            mouse,
            coords: agElementFinder
                .get('cell', {
                    colIndex,
                    rowIndex,
                })
                ?.getPos(),
            clickType: 'right',
            scriptDebugger,
        });
        await waitFor(200);
    }

    function getMenuItemElAtIndex(index: number) {
        const menuItemName = menuItemPath[index];
        const menuItemTextEl = findElementWithInnerText({ selector: '.ag-menu-option-text', text: menuItemName });

        return menuItemTextEl?.parentElement;
    }

    const overlay = getOverlay && getOverlay();
    for (let i = 0; i < menuItemPath.length; i++) {
        const menuItemName = menuItemPath[i];

        const coords = agElementFinder
            .get('contextMenuItem', {
                text: menuItemName,
            })
            ?.getPos();
        const menuItemEl = getMenuItemElAtIndex(i);
        const isLastMenuItem = i === menuItemPath.length - 1;
        if (!coords || !menuItemEl) {
            throw new Error(`Cannot find menu item: ${menuItemName}`);
        }

        // Remove all active highlights
        const menuList = menuItemEl.parentElement;
        menuList?.querySelectorAll(`.${AG_MENU_OPTION_ACTIVE_CLASSNAME}`).forEach((el) => {
            el.classList.remove(AG_MENU_OPTION_ACTIVE_CLASSNAME);
        });

        await createMoveMouse({
            mouse,
            toPos: coords,
            speed,
            duration,
            tweenGroup,
            easing,
            tweenOnChange: ({ coords }) => {
                let prevPointerEventsValue;
                if (overlay) {
                    prevPointerEventsValue = overlay.style.pointerEvents;
                    overlay.style.pointerEvents = 'none';
                }
                const hoverOverEl = document.elementFromPoint(coords.x, coords.y);
                if (overlay) {
                    overlay.style.pointerEvents = prevPointerEventsValue;
                }
                if (hoverOverEl) {
                    clearAllMenuOptionHighlights();

                    const menuOption = hoverOverEl.closest(AG_MENU_OPTION_SELECTOR);
                    if (menuOption && !menuOption.classList.contains(AG_MENU_OPTION_DISABLED_CLASSNAME)) {
                        menuOption.classList.add(AG_MENU_OPTION_ACTIVE_CLASSNAME);
                    }
                }
            },
            scriptDebugger,
        });
        // Add active highlight
        menuItemEl.classList.add(AG_MENU_OPTION_ACTIVE_CLASSNAME);

        if (isLastMenuItem) {
            mouse.click();
            await waitFor(500);

            // Send escape for each menu item in reverse, to clear the entire context menu
            // NOTE: Not triggering keyboard event, use the Grid API instead, so it is more resilient to browser events
            for (let j = menuItemPath.length - 1; j >= 0; j--) {
                const closeMenuItemEl = getMenuItemElAtIndex(j);
                closeMenuItemEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            }
        } else {
            // Use keyboard event to fake a click
            menuItemEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        }

        await waitFor(200);
    }
}
