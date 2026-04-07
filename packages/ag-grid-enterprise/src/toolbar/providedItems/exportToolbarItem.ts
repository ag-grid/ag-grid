import type { IconName, MenuItemDef } from 'ag-grid-community';
import { _createIconNoSpan, _focusInto } from 'ag-grid-community';

import { MenuList } from '../../widgets/menuList';
import { AbstractToolbarItemComp } from './abstractToolbarItemComp';

export class ExportToolbarItem extends AbstractToolbarItemComp {
    protected getIconName(): IconName {
        return 'save';
    }

    protected getLocaleKey(): string {
        return 'toolbarExport';
    }

    protected getDefaultLabel(): string {
        return 'Export';
    }

    protected onAction(): void {
        const menuItems = this.getExportMenuItems();
        if (menuItems.length === 0) {
            return;
        }

        this.showExportMenu(menuItems);
    }

    private getExportMenuItems(): MenuItemDef[] {
        const { gos, beans } = this;
        const localeTextFunc = this.getLocaleTextFunc();
        const items: MenuItemDef[] = [];

        if (!gos.get('suppressCsvExport') && beans.csvCreator) {
            items.push({
                name: localeTextFunc('csvExport', 'CSV Export'),
                icon: _createIconNoSpan('csvExport', beans, null),
                action: () => beans.gridApi.exportDataAsCsv(),
            });
        }

        if (!gos.get('suppressExcelExport') && beans.excelCreator) {
            items.push({
                name: localeTextFunc('excelExport', 'Excel Export'),
                icon: _createIconNoSpan('excelExport', beans, null),
                action: () => beans.gridApi.exportDataAsExcel(),
            });
        }

        return items;
    }

    private showExportMenu(menuItems: MenuItemDef[]): void {
        const eGui = this.getGui();
        const popupSvc = this.beans.popupSvc!;

        const eMenu = document.createElement('div');
        eMenu.classList.add('ag-menu');

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
