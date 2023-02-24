import { FocusService } from "../focusService";
import { Autowired, PostConstruct } from "../context/context";
import { AgMenuItemComponent, MenuItemSelectedEvent, MenuItemActivatedEvent } from "./agMenuItemComponent";
import { TabGuardComp } from "./tabGuardComp";
import { KeyCode } from "../constants/keyCode";
import { MenuItemDef } from "../entities/gridOptions";
import { loadTemplate } from "../utils/dom";
import { last } from "../utils/array";
import { setAriaLevel } from "../utils/aria";

export class AgMenuList extends TabGuardComp {

    @Autowired('focusService') private readonly focusService: FocusService;

    private menuItems: AgMenuItemComponent[] = [];
    private activeMenuItem: AgMenuItemComponent | null;

    constructor(private readonly level = 1) {
        super(/* html */`<div class="ag-menu-list" role="tree"></div>`);
    }

    @PostConstruct
    private postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e)
        });
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        const parent = this.getParentComponent();
        const parentGui = parent && parent.getGui();
        const isManaged = parentGui && parentGui.classList.contains('ag-focus-managed');

        if (!isManaged) {
            e.preventDefault();
        }

        if (e.shiftKey) {
            this.closeIfIsChild(e);
        }
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
            case KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.key);
                break;
            case KeyCode.ESCAPE:
                const topMenu = this.findTopMenu();

                if (topMenu) {
                    this.focusService.focusInto(topMenu.getGui());
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
                console.warn(`AG Grid: unrecognised menu item ${menuItemOrString}`);
            } else {
                this.addItem(menuItemOrString);
            }
        });
    }

    public addItem(menuItemDef: MenuItemDef): void {
        const menuItem = this.createManagedBean(new AgMenuItemComponent({
            ...menuItemDef,
            isAnotherSubMenuOpen: () => this.menuItems.some(m => m.isSubMenuOpen())
        }));

        menuItem.setParentComponent(this);

        setAriaLevel(menuItem.getGui(), this.level);

        this.menuItems.push(menuItem);
        this.appendChild(menuItem.getGui());

        this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_SELECTED, (event: MenuItemSelectedEvent) => {
            this.dispatchEvent(event);
        });

        this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event: MenuItemActivatedEvent) => {
            if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                this.activeMenuItem.deactivate();
            }

            this.activeMenuItem = event.menuItem;
        });
    }

    public activateFirstItem(): void {
        const item = this.menuItems.filter(currentItem => !currentItem.isDisabled())[0];

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

        this.appendChild(loadTemplate(separatorHtml));
    }

    private findTopMenu(): AgMenuList | undefined {
        let parent = this.getParentComponent();

        if (!parent && this instanceof AgMenuList) { return this; }

        while (true) {
            const nextParent = parent && parent.getParentComponent && parent.getParentComponent();

            if (!nextParent || (!(nextParent instanceof AgMenuList || nextParent instanceof AgMenuItemComponent))) {
                break;
            }

            parent = nextParent;
        }

        return parent instanceof AgMenuList ? parent : undefined;
    }

    private handleNavKey(key: string): void {
        switch (key) {
            case KeyCode.UP:
            case KeyCode.DOWN:
                const nextItem = this.findNextItem(key === KeyCode.UP);

                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate();
                }

                return;
        }

        const left = this.gridOptionsService.is('enableRtl') ? KeyCode.RIGHT : KeyCode.LEFT;

        if (key === left) {
            this.closeIfIsChild();
        } else {
            this.openChild();
        }
    }

    private closeIfIsChild(e?: KeyboardEvent): void {
        const parentItem = this.getParentComponent();

        if (parentItem && parentItem instanceof AgMenuItemComponent) {
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

    private findNextItem(up?: boolean): AgMenuItemComponent | undefined {
        const items = this.menuItems.filter(item => !item.isDisabled());

        if (!items.length) { return; }

        if (!this.activeMenuItem) {
            return up ? last(items) : items[0];
        }

        if (up) {
            items.reverse();
        }

        let nextItem: AgMenuItemComponent;
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

        return nextItem! || this.activeMenuItem;
    }

    protected destroy(): void {
        this.clearActiveItem();
        super.destroy();
    }
}
