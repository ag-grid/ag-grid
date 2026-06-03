import { _focusInto } from 'ag-stack';

import type { DefaultMenuItem, MenuItemDef, NamedBean } from 'ag-grid-community';
import { BeanStub, _createElement } from 'ag-grid-community';

import { MenuList } from '../widgets/menuList';
import type { MenuItemMapper } from './menuItemMapper';

interface ShowToolbarMenuParams {
    anchorElement: HTMLElement;
    menuItems: (DefaultMenuItem | MenuItemDef<any, any>)[];
    ariaLabel: string;
    onClose?: () => void;
}

export class ToolbarMenuBuilder extends BeanStub implements NamedBean {
    beanName = 'toolbarMenuBuilder' as const;

    public showMenu(params: ShowToolbarMenuParams): void {
        const { anchorElement, menuItems, ariaLabel, onClose } = params;
        const { popupSvc, menuItemMapper } = this.beans;
        if (!popupSvc || !menuItemMapper) {
            return;
        }

        const eMenu = _createElement({ tag: 'div', cls: 'ag-menu' });
        const menuList = this.createBean(new MenuList());
        eMenu.appendChild(menuList.getGui());
        menuList.addMenuItems(
            (menuItemMapper as MenuItemMapper).mapWithStockItems(
                menuItems,
                null,
                null,
                undefined,
                () => anchorElement,
                'contextMenu'
            )
        );

        let hidePopup: (() => void) | undefined;
        menuList.addManagedListeners(menuList, {
            closeMenu: () => hidePopup?.(),
        });

        popupSvc.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            afterGuiAttached: (attachedParams) => {
                hidePopup = attachedParams.hidePopup;
                _focusInto(menuList.getGui());
            },
            ariaLabel,
            closedCallback: () => {
                this.destroyBean(menuList);
                onClose?.();
            },
        });

        popupSvc.positionPopupByComponent({
            type: 'toolbar',
            eventSource: anchorElement,
            ePopup: eMenu,
            position: 'under',
            nudgeY: 4,
            keepWithinBounds: true,
        });
    }
}
