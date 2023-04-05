import { Group } from '@tweenjs/tween.js';
import { getCellPos, getContextMenuItemPos } from '../agQuery';
import { Mouse } from '../createMouse';
import { findElementWithInnerText } from '../dom';
import { ScriptDebugger } from '../scriptDebugger';
import { EasingFunction } from '../tween';
import { createMoveMouse } from './createMoveMouse';
import { rightClick } from './rightClick';
import { waitFor } from './waitFor';

export interface ClickOnContextMenuItemParams {
    containerEl?: HTMLElement;
    mouse: Mouse;
    cellColIndex: number;
    cellRowIndex: number;
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
    scriptDebugger?: ScriptDebugger;
}

export async function clickOnContextMenuItem({
    containerEl,
    mouse,
    cellColIndex,
    cellRowIndex,
    menuItemPath,
    speed,
    duration,
    tweenGroup,
    easing,
    scriptDebugger,
}: ClickOnContextMenuItemParams): Promise<void> {
    await rightClick({
        mouse,
        coords: getCellPos({ containerEl, colIndex: cellColIndex, rowIndex: cellRowIndex })!,
    });
    await waitFor(200);

    for (let i = 0; i < menuItemPath.length; i++) {
        const menuItemName = menuItemPath[i];
        const coords = getContextMenuItemPos({ containerEl, menuItemName });
        const menuItemTextEl = findElementWithInnerText({ selector: '.ag-menu-option-text', text: menuItemName });
        const menuItemEl = menuItemTextEl?.parentElement;
        const isLastMenuItem = i === menuItemPath.length - 1;
        if (!coords || !menuItemEl) {
            console.error(`Cannot find menu item: ${menuItemName}`);
            break;
        }

        await createMoveMouse({
            mouse,
            toPos: coords,
            speed,
            duration,
            tweenGroup,
            easing,
            scriptDebugger,
        });
        if (isLastMenuItem) {
            mouse.click();
        }
        await waitFor(500);

        // Use keyboard event to fake a click
        menuItemEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    }
}
