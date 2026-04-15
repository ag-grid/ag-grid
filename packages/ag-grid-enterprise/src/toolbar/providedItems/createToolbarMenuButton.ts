import type {
    BeanCollection,
    GridOptionsService,
    IToolbarItemComp,
    IToolbarItemParams,
    IconName,
    LocaleTextFunc,
    MenuItemDef,
} from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _createElement,
    _createIconNoSpan,
    _focusInto,
    _setAriaHidden,
} from 'ag-grid-community';

import { MenuList } from '../../widgets/menuList';

interface ToolbarMenuButtonConfig {
    icon: IconName;
    localeKey: string;
    defaultLabel: string;
    getMenuItems: (beans: BeanCollection, localeTextFunc: LocaleTextFunc) => MenuItemDef[];
    onInit?: (comp: Component, gos: GridOptionsService, beans: BeanCollection) => void;
}

export function createToolbarMenuButton(config: ToolbarMenuButtonConfig): new () => IToolbarItemComp {
    class ToolbarMenuButton extends Component implements IToolbarItemComp {
        private readonly eIcon: HTMLElement = RefPlaceholder;
        private readonly eLabel: HTMLElement = RefPlaceholder;

        constructor() {
            super({
                tag: 'button',
                cls: 'ag-toolbar-item ag-toolbar-button',
                attrs: { type: 'button' },
                children: [
                    { tag: 'span', ref: 'eIcon', cls: 'ag-toolbar-button-icon', attrs: { 'aria-hidden': 'true' } },
                    { tag: 'span', ref: 'eLabel', cls: 'ag-toolbar-button-label' },
                ],
            });
        }

        public postConstruct(): void {
            const icon = _createIconNoSpan(config.icon, this.beans);
            if (icon) {
                this.eIcon.appendChild(icon);
            }

            const label = this.getLocaleTextFunc()(config.localeKey, config.defaultLabel);
            this.eLabel.textContent = label;
            this.getGui().setAttribute('aria-label', label);
            this.getGui().setAttribute('title', label);

            const chevronIcon = _createIconNoSpan('selectOpen', this.beans);
            if (chevronIcon) {
                const eChevron = _createElement({ tag: 'span', cls: 'ag-toolbar-button-chevron' });
                _setAriaHidden(eChevron, true);
                eChevron.appendChild(chevronIcon);
                this.getGui().appendChild(eChevron);
            }

            this.addManagedElementListeners(this.getGui(), { click: () => this.onAction() });
        }

        public init(params: IToolbarItemParams): void {
            this.refresh(params);
            config.onInit?.(this, this.gos, this.beans);
        }

        public refresh(params: IToolbarItemParams): boolean {
            this.eLabel.classList.toggle('ag-hidden', params.display !== 'iconAndLabel');
            return true;
        }

        private onAction(): void {
            const menuItems = config.getMenuItems(this.beans, this.getLocaleTextFunc());
            if (menuItems.length === 0) {
                return;
            }

            this.showMenu(menuItems);
        }

        private showMenu(menuItems: MenuItemDef[]): void {
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
                ariaLabel: this.getLocaleTextFunc()(config.localeKey, config.defaultLabel),
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
    return ToolbarMenuButton;
}
