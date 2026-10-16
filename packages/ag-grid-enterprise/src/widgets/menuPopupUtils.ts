import type { BeanCollection, Component, IMenuActionParams, MenuItemDef, WithoutGridCommon } from 'ag-grid-community';
import { _createElement } from 'ag-grid-community';

import { MenuList } from './menuList';

interface ShowMenuListPopupParams {
    menuItems: (MenuItemDef | 'separator')[];
    menuContext: WithoutGridCommon<IMenuActionParams>;
    /** Positions under the mouse/touch location, or under this element for keyboard invocation. */
    positionBy: MouseEvent | Touch | HTMLElement;
    /** Refocuses the invoking element; called whenever the menu closes from the keyboard. */
    restoreFocus: () => void;
    /** Popup container to reuse (must carry the `ag-menu` class); one is created when omitted. */
    ePopup?: HTMLElement;
    onClosed?: () => void;
}

/** Whether a keydown is the keyboard equivalent of a right-click (the context-menu key or Shift+F10). */
export function _isContextMenuKey(event: KeyboardEvent): boolean {
    return event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
}

/** Shows `menuItems` as a modal column context menu popup and returns the function that hides it. */
export function _showMenuListPopup(
    parent: Component<any>,
    beans: BeanCollection,
    params: ShowMenuListPopupParams
): (() => void) | undefined {
    const { menuItems, menuContext, positionBy, restoreFocus, onClosed } = params;

    const menu = parent.createBean(new MenuList(0, menuContext));
    menu.addMenuItems(menuItems);
    const ePopup = params.ePopup ?? _createElement({ tag: 'div', cls: 'ag-menu' });
    ePopup.appendChild(menu.getGui());

    const popupSvc = beans.popupSvc!;
    const addPopupRes = popupSvc.addPopup({
        modal: true,
        eChild: ePopup,
        closeOnEsc: true,
        afterGuiAttached: () => menu.focusInto(),
        ariaLabel: parent.getLocaleTextFunc()('ariaLabelContextMenu', 'Context Menu'),
        closedCallback: (closeEvent?: MouseEvent | TouchEvent | KeyboardEvent) => {
            onClosed?.();
            parent.destroyBean(menu);
            if (closeEvent instanceof KeyboardEvent) {
                restoreFocus();
            }
        },
    });
    const hideFunc = addPopupRes?.hideFunc;

    menu.addManagedListeners(menu, {
        closeMenu: () => {
            restoreFocus();
            hideFunc?.();
        },
    });

    if (positionBy instanceof HTMLElement) {
        popupSvc.positionPopupByComponent({
            type: 'columnContextMenu',
            eventSource: positionBy,
            ePopup,
            position: 'under',
            keepWithinBounds: true,
        });
    } else {
        popupSvc.positionPopupUnderMouseEvent({
            type: 'columnContextMenu',
            mouseEvent: positionBy,
            ePopup,
        });
    }

    return hideFunc;
}
