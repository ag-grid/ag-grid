import type { IToolbarItemComp, IToolbarItemParams, IconName, MenuItemDef } from 'ag-grid-community';
import {
    Component,
    RefPlaceholder,
    _createElement,
    _createIconNoSpan,
    _focusInto,
    _setAriaHidden,
} from 'ag-grid-community';

import { MenuList } from '../../widgets/menuList';

interface MenuToolbarItemParams extends IToolbarItemParams {
    icon?: IconName;
    label?: string;
    menuItems?: (MenuItemDef | string)[];
}

export class MenuToolbarItem extends Component implements IToolbarItemComp {
    private readonly eIcon: HTMLElement = RefPlaceholder;
    private readonly eLabel: HTMLElement = RefPlaceholder;
    private menuItems: (MenuItemDef | string)[] = [];
    private label: string = '';
    private iconName: IconName = 'menu';

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
        this.addManagedElementListeners(this.getGui(), { click: () => this.onAction() });
    }

    public init(params: IToolbarItemParams): void {
        const { icon, label, menuItems } = params as MenuToolbarItemParams;

        this.menuItems = menuItems ?? [];
        this.label = label ?? this.getLocaleTextFunc()('toolbarMenu', 'Menu');
        this.iconName = icon ?? 'menu';

        const iconEl = _createIconNoSpan(this.iconName, this.beans);
        if (iconEl) {
            this.eIcon.appendChild(iconEl);
        }

        this.eLabel.textContent = this.label;
        this.getGui().setAttribute('aria-label', this.label);
        this.getGui().setAttribute('title', this.label);

        const chevronIcon = _createIconNoSpan('selectOpen', this.beans);
        if (chevronIcon) {
            const eChevron = _createElement({ tag: 'span', cls: 'ag-toolbar-button-chevron' });
            _setAriaHidden(eChevron, true);
            eChevron.appendChild(chevronIcon);
            this.getGui().appendChild(eChevron);
        }

        this.refresh(params);
    }

    public refresh(params: IToolbarItemParams): boolean {
        const { icon, label, menuItems } = params as MenuToolbarItemParams;

        // Icon changes require DOM reconstruction — force recreation
        if (icon != null && icon !== this.iconName) {
            return false;
        }

        if (menuItems != null) {
            this.menuItems = menuItems;
        }

        if (label != null && label !== this.label) {
            this.label = label;
            this.eLabel.textContent = this.label;
            this.getGui().setAttribute('aria-label', this.label);
            this.getGui().setAttribute('title', this.label);
        }

        this.eLabel.classList.toggle('ag-hidden', params.display !== 'iconAndLabel');
        return true;
    }

    private onAction(): void {
        if (this.menuItems.length === 0) {
            return;
        }
        this.showMenu(this.menuItems);
    }

    private showMenu(menuItems: (MenuItemDef | string)[]): void {
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
            ariaLabel: this.label,
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
