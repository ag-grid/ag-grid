import type {
    _AgCoreBeanCollection,
    _AgElementParams,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
    _WithoutCommon,
} from 'ag-grid-community';
import { AgPromise, KeyCode, _AgTabGuardComp, _createAgElement, _last } from 'ag-grid-community';

import type {
    AgCloseMenuEvent,
    AgMenuItemActivatedEvent,
    AgMenuItemCallbacks,
    AgMenuItemComponentEvent,
    AgMenuItemDef,
} from './agMenuItemComponent';
import { AgMenuItemComponent } from './agMenuItemComponent';

type AgMenuListEvent = AgMenuItemComponentEvent;

export class AgMenuList<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TMenuActionParams extends TCommon,
> extends _AgTabGuardComp<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType,
    AgMenuListEvent
> {
    private readonly menuItems: AgMenuItemComponent<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TMenuActionParams
    >[] = [];
    private activeMenuItem: AgMenuItemComponent<
        TBeanCollection,
        TProperties,
        TGlobalEvents,
        TCommon,
        TPropertiesService,
        TComponentSelectorType,
        TMenuActionParams
    > | null;
    constructor(
        private readonly level = 0,
        private readonly menuActionParams: _WithoutCommon<TCommon, TMenuActionParams>,
        private readonly callbacks: AgMenuItemCallbacks<TBeanCollection, TMenuActionParams, TCommon>
    ) {
        super({ tag: 'div', cls: 'ag-menu-list', role: 'menu' });
    }

    public postConstruct() {
        this.initialiseTabGuard({
            onTabKeyDown: (e) => this.onTabKeyDown(e),
            handleKeyDown: (e) => this.callbacks.preserveRangesWhile(this.beans, () => this.handleKeyDown(e)),
            onFocusIn: (e) => this.handleFocusIn(e),
            onFocusOut: (e) => this.handleFocusOut(e),
        });
    }

    private onTabKeyDown(e: KeyboardEvent) {
        const parent = this.getParentComponent();
        const isManaged = parent?.getGui()?.classList.contains('ag-focus-managed');

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
                    this.callbacks.stopPropagationCallbacks.stopPropagation(e);
                }
                break;
        }
    }

    private handleFocusIn(e: FocusEvent): void {
        // if focus is coming from outside the menu list, then re-activate an item
        const oldFocusedElement = e.relatedTarget as HTMLElement;
        if (
            !this.tabGuardFeature.getTabGuardCtrl().isTabGuard(oldFocusedElement) &&
            (this.getGui().contains(oldFocusedElement) ||
                this.activeMenuItem?.getSubMenuGui()?.contains(oldFocusedElement))
        ) {
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
        if (
            !this.activeMenuItem ||
            this.getGui().contains(newFocusedElement) ||
            this.activeMenuItem.getSubMenuGui()?.contains(newFocusedElement)
        ) {
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

    public addMenuItems(menuItems?: (AgMenuItemDef<TMenuActionParams, TCommon> | string)[]): void {
        if (menuItems == null) {
            return;
        }

        AgPromise.all(
            menuItems.map<
                AgPromise<{
                    eGui: HTMLElement | null;
                    comp?: AgMenuItemComponent<
                        TBeanCollection,
                        TProperties,
                        TGlobalEvents,
                        TCommon,
                        TPropertiesService,
                        TComponentSelectorType,
                        TMenuActionParams
                    >;
                }>
            >((menuItemOrString) => {
                if (menuItemOrString === 'separator') {
                    return AgPromise.resolve({ eGui: this.createSeparator() });
                } else if (typeof menuItemOrString === 'string') {
                    this.callbacks.warnNoItem?.(menuItemOrString);
                    return AgPromise.resolve({ eGui: null });
                } else {
                    return this.addItem(menuItemOrString);
                }
            })
        ).then((elements) => {
            for (const element of elements ?? []) {
                if (element?.eGui) {
                    this.appendChild(element.eGui);
                    if (element.comp) {
                        this.menuItems.push(element.comp);
                    }
                }
            }
        });
    }

    private addItem(menuItemDef: AgMenuItemDef<TMenuActionParams, TCommon>): AgPromise<{
        comp: AgMenuItemComponent<
            TBeanCollection,
            TProperties,
            TGlobalEvents,
            TCommon,
            TPropertiesService,
            TComponentSelectorType,
            TMenuActionParams
        >;
        eGui: HTMLElement;
    }> {
        const menuItem = this.createManagedBean(
            new AgMenuItemComponent<
                TBeanCollection,
                TProperties,
                TGlobalEvents,
                TCommon,
                TPropertiesService,
                TComponentSelectorType,
                TMenuActionParams
            >(this.callbacks)
        );
        return menuItem
            .init({
                menuItemDef,
                isAnotherSubMenuOpen: () => this.menuItems.some((m) => m.isSubMenuOpen()),
                level: this.level,
                contextParams: this.menuActionParams,
            })
            .then(() => {
                menuItem.setParentComponent(this);

                this.addManagedListeners(menuItem, {
                    closeMenu: (event: AgCloseMenuEvent) => {
                        this.dispatchLocalEvent(event);
                    },
                    menuItemActivated: (
                        event: AgMenuItemActivatedEvent<
                            TBeanCollection,
                            TProperties,
                            TGlobalEvents,
                            TCommon,
                            TPropertiesService,
                            TComponentSelectorType,
                            TMenuActionParams
                        >
                    ) => {
                        if (this.activeMenuItem && this.activeMenuItem !== event.menuItem) {
                            this.activeMenuItem.deactivate();
                        }

                        this.activeMenuItem = event.menuItem;
                    },
                });

                return {
                    comp: menuItem,
                    eGui: menuItem.getGui(),
                };
            });
    }

    public activateFirstItem(): void {
        const item = this.menuItems.filter((currentItem) => !currentItem.isDisabled())[0];

        if (!item) {
            return;
        }

        item.activate();
    }

    private createSeparator(): HTMLElement {
        const part: _AgElementParams<TComponentSelectorType> = { tag: 'div', cls: 'ag-menu-separator-part' };
        return _createAgElement({
            tag: 'div',
            cls: 'ag-menu-separator',
            attrs: {
                'aria-hidden': 'true',
            },
            children: [part, part, part, part],
        });
    }

    private handleNavKey(key: string): void {
        switch (key) {
            case KeyCode.UP:
            case KeyCode.DOWN: {
                const nextItem = this.findNextItem(key === KeyCode.UP);

                if (nextItem && nextItem !== this.activeMenuItem) {
                    nextItem.activate(false, true);
                }

                return;
            }
        }

        const left = this.gos.get('enableRtl') ? KeyCode.RIGHT : KeyCode.LEFT;

        if (key === left) {
            this.closeIfIsChild();
        } else {
            this.openChild();
        }
    }

    private closeIfIsChild(e?: KeyboardEvent): boolean {
        const parentItem = this.getParentComponent();

        if (parentItem && parentItem instanceof AgMenuItemComponent) {
            if (e) {
                e.preventDefault();
            }

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

    private findNextItem(
        up?: boolean
    ):
        | AgMenuItemComponent<
              TBeanCollection,
              TProperties,
              TGlobalEvents,
              TCommon,
              TPropertiesService,
              TComponentSelectorType,
              TMenuActionParams
          >
        | undefined {
        const items = [...this.menuItems];

        if (!items.length) {
            return;
        }

        if (!this.activeMenuItem) {
            return up ? _last(items) : items[0];
        }

        if (up) {
            items.reverse();
        }

        let nextItem:
            | AgMenuItemComponent<
                  TBeanCollection,
                  TProperties,
                  TGlobalEvents,
                  TCommon,
                  TPropertiesService,
                  TComponentSelectorType,
                  TMenuActionParams
              >
            | undefined;
        let foundCurrent = false;

        for (const item of items) {
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

    public override destroy(): void {
        this.clearActiveItem();
        super.destroy();
    }
}
