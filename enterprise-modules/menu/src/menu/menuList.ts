import {
    Autowired,
    Constants,
    GridOptionsWrapper,
    ManagedFocusComponent,
    MenuItemDef,
    _,
} from "@ag-grid-community/core";
import { MenuItemComponent, MenuItemSelectedEvent, MenuItemActivatedEvent } from "./menuItemComponent";
import { MenuSeparator } from './menuSeparator';

export class MenuList extends ManagedFocusComponent {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private menuItems: MenuItemComponent[] = [];
    private activeMenuItem: MenuItemComponent | null;

    constructor() {
        super(/* html */`<div class="ag-menu-list"></div>`);
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        const parent = this.getParentComponent();
        const isManaged = parent && parent instanceof ManagedFocusComponent;

        if (!isManaged) {
            e.preventDefault();
        }

        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case Constants.KEY_UP:
            case Constants.KEY_RIGHT:
            case Constants.KEY_DOWN:
            case Constants.KEY_LEFT:
                e.preventDefault();
                this.handleNavKey(e.keyCode);
                break;
            case Constants.KEY_ESCAPE:
                const topMenu = this.findTopMenu();

                if (topMenu) {
                    topMenu.getGui().focus();
                }

                break;
        }
    }

    protected isFocusableContainer(): boolean {
        return true;
    }

    public clearActiveItem(): void {
        if (this.activeMenuItem) {
            this.activeMenuItem.deactivate();
        }
    }

    public addMenuItems(menuItems?: (MenuItemDef | string)[]): void {
        if (menuItems == null) { return; }

        menuItems.forEach(menuItemOrString => {
            if (menuItemOrString === 'separator') {
                this.appendChild(this.createManagedBean(new MenuSeparator()));
            } else if (typeof menuItemOrString === 'string') {
                console.warn(`ag-Grid: unrecognised menu item ${menuItemOrString}`);
            } else {
                this.addItem(menuItemOrString);
            }
        });
    }

    public addItem(menuItemDef: MenuItemDef): void {
        const menuItem = this.createManagedBean(new MenuItemComponent(menuItemDef));
        menuItem.setParentComponent(this);

        this.menuItems.push(menuItem);
        this.appendChild(menuItem.getGui());

        this.addManagedListener(menuItem, MenuItemComponent.EVENT_MENU_ITEM_SELECTED, (event: MenuItemSelectedEvent) => {
            this.dispatchEvent(event);
        });

        this.addManagedListener(menuItem, MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event: MenuItemActivatedEvent) => {
            if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                this.activeMenuItem.deactivate();
            }

            this.activeMenuItem = event.menuItem;
        });
    }

    public activateFirstItem(): void {
        const item = this.menuItems.filter(item => !item.isDisabled())[0];

        if (!item) { return; }

        item.activate();
    }

    private findTopMenu(): MenuList | undefined {
        let parent = this.getParentComponent();

        if (!parent && this instanceof MenuList) { return this; }

        while (true) {
            const nextParent = parent && parent.getParentComponent && parent.getParentComponent();

            if (!nextParent || (!(nextParent instanceof MenuList || nextParent instanceof MenuItemComponent))) {
                break;
            }

            parent = nextParent;
        }

        return parent instanceof MenuList ? parent : undefined;
    }

    private handleNavKey(key: number): void {
        switch (key) {
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                const nextItem = this.findNextItem(key === Constants.KEY_UP);

                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }

                return;
        }

        const left = this.gridOptionsWrapper.isEnableRtl() ? Constants.KEY_RIGHT : Constants.KEY_LEFT;

        if (key === left) {
            this.closeIfIsChild();
        } else {
            this.openChild();
        }
    }

    private closeIfIsChild(e?: KeyboardEvent): void {
        const parentItem = this.getParentComponent();

        if (parentItem && parentItem instanceof MenuItemComponent) {
            if (e) { e.preventDefault(); }

            parentItem.closeSubMenu();
            parentItem.getGui().focus();
        }
    }

    private openChild(): void {
        if (this.activeMenuItem) {
            this.activeMenuItem.openSubMenu(true);
        }
    }

    private findNextItem(up?: boolean): MenuItemComponent | undefined {
        const items = this.menuItems.filter(item => !item.isDisabled());

        if (!items.length) { return; }

        if (!this.activeMenuItem) {
            return up ? _.last(items) : items[0];
        }

        if (up) {
            items.reverse();
        }

        let nextItem: MenuItemComponent;
        let foundCurrent = false;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!foundCurrent) {
                if (item === this.activeMenuItem) {
                    foundCurrent = true;
                }

                continue;
            }

            nextItem = item;

            break;
        }

        return nextItem || this.activeMenuItem;
    }

    protected destroy(): void {
        this.clearActiveItem();
        super.destroy();
    }
}
