import type { IconName, MenuItemDef } from 'ag-grid-community';
import { _createElement, _createIconNoSpan, _focusInto, _setAriaHidden } from 'ag-grid-community';

import { getExportMenuItems } from '../../menu/exportMenuItems';
import { MenuList } from '../../widgets/menuList';
import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class ExportToolbarItem extends AbstractToolbarItemComp {
    public override postConstruct(): void {
        super.postConstruct();

        const chevronIcon = _createIconNoSpan('selectOpen', this.beans);
        if (chevronIcon) {
            const eChevron = _createElement({ tag: 'span', cls: 'ag-toolbar-button-chevron' });
            _setAriaHidden(eChevron, true);
            eChevron.appendChild(chevronIcon);
            this.getGui().appendChild(eChevron);
        }
    }

    protected getIconName(): IconName {
        return 'save';
    }

    protected getLocaleKey(): string {
        return 'export';
    }

    protected getDefaultLabel(): string {
        return 'Export';
    }

    protected onAction(): void {
        const menuItems = getExportMenuItems(this.beans, this.getLocaleTextFunc());
        if (menuItems.length === 0) {
            return;
        }

        this.showExportMenu(menuItems);
    }

    private showExportMenu(menuItems: MenuItemDef[]): void {
        const eGui = this.getGui();
        const popupSvc = this.beans.popupSvc!;

        const eMenu = _createElement({ tag: 'div', cls: 'ag-menu' });

        const menuList = this.createBean(new MenuList());
        eMenu.appendChild(menuList.getGui());
        menuList.addMenuItems(menuItems);

        let hideFunc = () => {};

        menuList.addManagedListeners(menuList, {
            closeMenu: () => hideFunc(),
        });

        const addPopupRes = popupSvc.addPopup({
            modal: true,
            eChild: eMenu,
            closeOnEsc: true,
            afterGuiAttached: () => _focusInto(menuList.getGui()),
            ariaLabel: this.getLocaleTextFunc()('export', 'Export'),
            closedCallback: () => {
                this.destroyBean(menuList);
                eGui.focus();
            },
        });

        if (addPopupRes) {
            hideFunc = addPopupRes.hideFunc;
        }

        popupSvc.positionPopupByComponent({
            type: 'toolbar',
            eventSource: eGui,
            ePopup: eMenu,
            position: 'under',
            nudgeY: 4,
            keepWithinBounds: true,
        });
    }
}
