import { FocusService } from "../focusService";
import { Autowired, PostConstruct } from "../context/context";
import { AgMenuItemComponent, CloseMenuEvent, MenuItemActivatedEvent } from "./agMenuItemComponent";
import { TabGuardComp } from "./tabGuardComp";
import { KeyCode } from "../constants/keyCode";
import { MenuItemDef } from "../interfaces/menuItem";
import { loadTemplate } from "../utils/dom";
import { last } from "../utils/array";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { IMenuActionParams } from "../interfaces/iCallbackParams";
import { BeanStub } from "../context/beanStub";
import { AgPromise } from "../utils/promise";
import { stopPropagationForAgGrid } from "../utils/event";

export class AgMenuList extends TabGuardComp {

    @Autowired('focusService') private readonly focusService: FocusService;

    private menuItems: AgMenuItemComponent[] = [];
    private activeMenuItem: AgMenuItemComponent | null;
    private params: WithoutGridCommon<IMenuActionParams>;

    constructor(private readonly level = 0, params?: WithoutGridCommon<IMenuActionParams>) {
        super(/* html */`<div class="ag-menu-list" role="tree"></div>`);
        this.params = params ?? {
            column: null,
            node: null,
            value: null
        };
    }

    @PostConstruct
    private postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e),
            onFocusIn: e => this.handleFocusIn(e),
            onFocusOut: e => this.handleFocusOut(e),
        });
    }

    private onTabKeyDown(e: KeyboardEvent) {
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

    private handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.UP:
            case KeyCode.RIGHT:
            case KeyCode.DOWN:
            case KeyCode.LEFT:
                e.preventDefault();
                this.handleNavKey(e.key);
                break;
            case KeyCode.ESCAPE:
                if (this.closeIfIsChild()) {
                    stopPropagationForAgGrid(e);
                }
                break;
        }
    }

    private handleFocusIn(e: FocusEvent): void {
        // if focus is coming from outside the menu list, then re-activate an item
        const oldFocusedElement = e.relatedTarget as HTMLElement;
        if (!this.tabGuardCtrl.isTabGuard(oldFocusedElement) && (
            this.getGui().contains(oldFocusedElement) || this.activeMenuItem?.getSubMenuGui()?.contains(oldFocusedElement)
        )) {
            return;
        }
        if (this.activeMenuItem) {
            this.activeMenuItem.activate();
        } else {
            this.activateFirstItem();
        }
    }

    private handleFocusOut(e: FocusEvent): void {
        // if focus is going outside the menu list, deactivate the current item
        const newFocusedElement = e.relatedTarget as HTMLElement;
        if (!this.activeMenuItem || this.getGui().contains(newFocusedElement) || this.activeMenuItem.getSubMenuGui()?.contains(newFocusedElement)) {
            return;
        }
        if (!this.activeMenuItem.isSubMenuOpening()) {
            this.activeMenuItem.deactivate();
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

        AgPromise.all(menuItems.map<AgPromise<{ eGui: HTMLElement | null, comp?: AgMenuItemComponent }>>(menuItemOrString => {
            if (menuItemOrString === 'separator') {
                return AgPromise.resolve({ eGui: this.createSeparator() });
            } else if (typeof menuItemOrString === 'string') {
                console.warn(`AG Grid: unrecognised menu item ${menuItemOrString}`);
                return AgPromise.resolve({ eGui: null });
            } else {
                return this.addItem(menuItemOrString);
            }
        })).then(elements => {
            elements!.forEach(element => {
                if (element?.eGui) {
                    this.appendChild(element.eGui);
                    if (element.comp) {
                        this.menuItems.push(element.comp);
                    }
                }
            })
        });
    }

    private addItem(menuItemDef: MenuItemDef): AgPromise<{ comp: AgMenuItemComponent, eGui: HTMLElement }> {
        const menuItem = this.createManagedBean(new AgMenuItemComponent());
        return menuItem.init({
            menuItemDef,
            isAnotherSubMenuOpen: () => this.menuItems.some(m => m.isSubMenuOpen()),
            level: this.level,
            contextParams: this.params
        }).then(() => {
            menuItem.setParentComponent(this);

            this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_CLOSE_MENU, (event: CloseMenuEvent) => {
                this.dispatchEvent(event);
            });

            this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event: MenuItemActivatedEvent) => {
                if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                    this.activeMenuItem.deactivate();
                }

                this.activeMenuItem = event.menuItem;
            });

            return {
                comp: menuItem,
                eGui: menuItem.getGui()
            };
        });
    }

    public activateFirstItem(): void {
        const item = this.menuItems.filter(currentItem => !currentItem.isDisabled())[0];

        if (!item) { return; }

        item.activate();
    }

    private createSeparator(): HTMLElement {
        const separatorHtml = /* html */`
            <div class="ag-menu-separator" aria-hidden="true">
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
                <div class="ag-menu-separator-part"></div>
            </div>`;

        return loadTemplate(separatorHtml);
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

        const left = this.gos.get('enableRtl') ? KeyCode.RIGHT : KeyCode.LEFT;

        if (key === left) {
            this.closeIfIsChild();
        } else {
            this.openChild();
        }
    }

    private closeIfIsChild(e?: KeyboardEvent): boolean {
        const parentItem = this.getParentComponent() as BeanStub;

        if (parentItem && parentItem instanceof AgMenuItemComponent) {
            if (e) { e.preventDefault(); }

            parentItem.closeSubMenu();
            parentItem.getGui().focus();
            return true;
        }
        return false;
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

        let nextItem: AgMenuItemComponent | undefined;
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

        if (foundCurrent && !nextItem) {
            // start again from the beginning (/end)
            return items[0];
        }

        return nextItem! || this.activeMenuItem;
    }

    protected destroy(): void {
        this.clearActiveItem();
        super.destroy();
    }
}
