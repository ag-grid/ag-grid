import {
    Autowired,
    GridOptionsWrapper,
    ManagedFocusComponent,
    MenuItemDef,
    _,
    KeyCode,
} from "@ag-grid-community/core";
import { MenuItemComponent, MenuItemSelectedEvent, MenuItemActivatedEvent } from "./menuItemComponent";

export class MenuList extends ManagedFocusComponent {
    @Autowired('gridOptionsWrapper') private readonly gridOptionsWrapper: GridOptionsWrapper;

    private menuItems: MenuItemComponent[] = [];
    private activeMenuItem: MenuItemComponent | null;

    constructor(private readonly level = 1) {
        super(/* html */`<div class="ag-menu-list" role="tree"></div>`, true);
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
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
            case KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.keyCode);
                break;
            case KeyCode.ESCAPE:
                const topMenu = this.findTopMenu();

                if (topMenu) {
                    this.focusController.focusInto(topMenu.getGui());
                }

                break;
        }
    }

    public clearActiveItem(): void {
        if (this.activeMenuItem) {
            this.activeMenuItem.deactivate();
            this.activeMenuItem = null;
        }
    }

    public addMenuItems(menuItems?: (MenuItemDef | string)[]): void {
        if (menuItems == null) { return; }

        menuItems.forEach(menuItemOrString => {
            if (menuItemOrString === 'separator') {
                this.addSeparator();
            } else if (typeof menuItemOrString === 'string') {
                console.warn(`ag-Grid: unrecognised menu item ${menuItemOrString}`);
            } else {
                this.addItem(menuItemOrString);
            }
        });
    }

    public addItem(menuItemDef: MenuItemDef): void {
        const menuItem = this.createManagedBean(new MenuItemComponent({
            ...menuItemDef,
            isAnotherSubMenuOpen: () => _.some(this.menuItems, m => m.isSubMenuOpen())
        }));

        menuItem.setParentComponent(this);

        _.setAriaLevel(menuItem.getGui(), this.level);

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

    private addSeparator() {
        const separatorHtml = /* html */`
            <div class="ag-menu-separator" aria-hidden="true">
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
            </div>`;

        this.appendChild(_.loadTemplate(separatorHtml));
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
            case KeyCode.UP:
            case KeyCode.DOWN:
                const nextItem = this.findNextItem(key === KeyCode.UP);

                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }

                return;
        }

        const left = this.gridOptionsWrapper.isEnableRtl() ? KeyCode.RIGHT : KeyCode.LEFT;

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
