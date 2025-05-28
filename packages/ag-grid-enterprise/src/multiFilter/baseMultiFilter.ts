import type { ContainerType, IAfterGuiAttachedParams, IMultiFilterDef, SharedFilterUi } from 'ag-grid-community';
import {
    AgPromise,
    KeyCode,
    TabGuardComp,
    _createElement,
    _focusInto,
    _getActiveDomElement,
    _isNothingFocused,
    _setAriaRole,
} from 'ag-grid-community';

import { AgGroupComponent } from '../widgets/agGroupComponent';
import type { MenuItemActivatedEvent } from '../widgets/agMenuItemComponent';
import { AgMenuItemComponent } from '../widgets/agMenuItemComponent';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { forEachReverse, getFilterTitle } from './multiFilterUtil';

export interface BaseFilterComponent {
    getGui(): HTMLElement;
}

export abstract class BaseMultiFilter<TFilterWrapper> extends TabGuardComp {
    protected filterDefs: IMultiFilterDef[] = [];
    private guiDestroyFuncs: (() => void)[] = [];
    // this could be the accordion/sub menu element depending on the display type
    private filterGuis: (HTMLElement | null)[] = [];
    private lastOpenedInContainer?: ContainerType;
    private lastActivatedMenuItem: AgMenuItemComponent | null = null;
    private hidePopup?: () => void;

    constructor() {
        super({ tag: 'div', cls: 'ag-multi-filter ag-menu-list-compact' });
    }

    protected abstract getFilterWrappers(): (TFilterWrapper | null)[];

    protected abstract getFilterFromWrapper(wrapper: TFilterWrapper): SharedFilterUi;
    protected abstract getCompFromWrapper(wrapper: TFilterWrapper): BaseFilterComponent;

    public postConstruct() {
        this.initialiseTabGuard({
            onFocusIn: (e) => this.onFocusIn(e),
        });
    }

    protected refreshGui(container: ContainerType): AgPromise<void> {
        if (container === this.lastOpenedInContainer) {
            return AgPromise.resolve();
        }

        this.tabGuardFeature.removeAllChildrenExceptTabGuards();
        this.destroyChildren();

        return AgPromise.all(
            this.getFilterWrappers().map((wrapper, index) => {
                if (!wrapper) {
                    return AgPromise.resolve(null);
                }
                const filter = this.getFilterFromWrapper(wrapper);
                const comp = this.getCompFromWrapper(wrapper);
                const filterDef = this.filterDefs[index];
                const filterTitle = getFilterTitle(filter, filterDef);
                let filterGuiPromise: AgPromise<HTMLElement>;

                if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
                    // prevent sub-menu being used in tool panel
                    filterGuiPromise = this.insertFilterMenu(comp, filterTitle).then((menuItem) => menuItem!.getGui());
                } else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
                    // sub-menus should appear as groups in the tool panel
                    const group = this.insertFilterGroup(filter, comp, filterTitle);

                    filterGuiPromise = AgPromise.resolve(group.getGui());
                } else {
                    // display inline
                    filterGuiPromise = AgPromise.resolve(comp.getGui());
                }

                return filterGuiPromise;
            })
        ).then((filterGuis) => {
            filterGuis!.forEach((filterGui, index) => {
                if (!filterGui) {
                    return;
                }
                if (index > 0) {
                    this.appendChild(_createElement({ tag: 'div', cls: 'ag-filter-separator' }));
                }
                this.appendChild(filterGui);
            });
            this.filterGuis = filterGuis!;
            this.lastOpenedInContainer = container;
        });
    }

    private destroyChildren() {
        this.guiDestroyFuncs.forEach((func) => func());
        this.guiDestroyFuncs.length = 0;
        this.filterGuis.length = 0;
    }

    private insertFilterMenu(comp: BaseFilterComponent, name: string): AgPromise<AgMenuItemComponent> {
        const eGui = comp.getGui();
        _setAriaRole(eGui, 'dialog');
        const menuItem = this.createBean(new AgMenuItemComponent());
        return menuItem
            .init({
                menuItemDef: {
                    name,
                    subMenu: [],
                    subMenuRole: 'dialog',
                    cssClasses: ['ag-multi-filter-menu-item'],
                    menuItem: AgMenuItemRenderer,
                    menuItemParams: {
                        cssClassPrefix: 'ag-compact-menu-option',
                        isCompact: true,
                    },
                },
                level: 0,
                isAnotherSubMenuOpen: () => false,
                childComponent: comp,
                contextParams: {
                    column: null,
                    node: null,
                    value: null,
                },
            })
            .then(() => {
                menuItem.setParentComponent(this);

                this.guiDestroyFuncs.push(() => this.destroyBean(menuItem));

                this.addManagedListeners(menuItem, {
                    menuItemActivated: (event: MenuItemActivatedEvent) => {
                        if (this.lastActivatedMenuItem && this.lastActivatedMenuItem !== event.menuItem) {
                            this.lastActivatedMenuItem.deactivate();
                        }

                        this.lastActivatedMenuItem = event.menuItem;
                    },
                });

                const menuItemGui = menuItem.getGui();
                menuItem.addManagedElementListeners(menuItemGui, {
                    // `AgMenuList` normally handles keyboard navigation, so need to do here
                    keydown: (e: KeyboardEvent) => {
                        const { key } = e;
                        switch (key) {
                            case KeyCode.UP:
                            case KeyCode.RIGHT:
                            case KeyCode.DOWN:
                            case KeyCode.LEFT:
                                e.preventDefault();
                                if (key === KeyCode.RIGHT) {
                                    menuItem.openSubMenu(true);
                                }
                                break;
                        }
                    },
                    focusin: () => menuItem.activate(),
                    focusout: () => {
                        if (!menuItem.isSubMenuOpen() && !menuItem.isSubMenuOpening()) {
                            menuItem.deactivate();
                        }
                    },
                });

                return menuItem;
            });
    }

    private insertFilterGroup(filter: SharedFilterUi, comp: BaseFilterComponent, title: string): AgGroupComponent {
        const group = this.createBean(
            new AgGroupComponent({
                title,
                cssIdentifier: 'multi-filter',
            })
        );

        this.guiDestroyFuncs.push(() => this.destroyBean(group));

        group.addItem(comp.getGui());
        group.toggleGroupExpand(false);

        if (filter.afterGuiAttached) {
            group.addManagedListeners(group, {
                expanded: () =>
                    filter.afterGuiAttached!({
                        container: this.lastOpenedInContainer!,
                        suppressFocus: true,
                        hidePopup: this.hidePopup,
                    }),
            });
        }

        return group;
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        let refreshPromise: AgPromise<void>;
        if (params) {
            this.hidePopup = params.hidePopup;
            refreshPromise = this.refreshGui(params.container!);
        } else {
            this.hidePopup = undefined;
            refreshPromise = AgPromise.resolve();
        }

        const suppressFocus = params?.suppressFocus;

        refreshPromise.then(() => {
            const { filterDefs, filterGuis, beans } = this;
            const wrappers = this.getFilterWrappers();
            // don't want to focus later if focus suppressed
            let hasFocused = !!suppressFocus;
            if (filterDefs) {
                forEachReverse(filterDefs, (filterDef, index) => {
                    const isFirst = index === 0;
                    const notInlineDisplayType = filterDef.display && filterDef.display !== 'inline';
                    const suppressFocusForFilter = suppressFocus || !isFirst || notInlineDisplayType;
                    const afterGuiAttachedParams = { ...(params ?? {}), suppressFocus: suppressFocusForFilter };
                    const wrapper = wrappers[index];
                    const filter = wrapper ? this.getFilterFromWrapper(wrapper) : undefined;
                    if (wrapper) {
                        const comp = this.getCompFromWrapper(wrapper);
                        if (comp !== filter) {
                            (comp as any).afterGuiAttached(afterGuiAttachedParams);
                        }
                    }
                    if (filter) {
                        this.executeFunctionIfExistsOnFilter(filter, 'afterGuiAttached', afterGuiAttachedParams);
                        if (isFirst && !suppressFocusForFilter) {
                            hasFocused = true;
                        }
                    }
                    if (!suppressFocus && isFirst && notInlineDisplayType) {
                        // focus the first filter container instead (accordion/sub menu)
                        const filterGui = filterGuis[index];
                        if (filterGui) {
                            if (!_focusInto(filterGui)) {
                                // menu item contains no focusable elements but is focusable itself
                                filterGui.focus({ preventScroll: true });
                            }
                            hasFocused = true;
                        }
                    }
                });
            }

            const activeEl = _getActiveDomElement(beans);

            // if we haven't focused the first item in the filter, we might run into two scenarios:
            // 1 - we are loading the filter for the first time and the component isn't ready,
            //     which means the document will have focus.
            // 2 - The focus will be somewhere inside the component due to auto focus
            // In both cases we need to force the focus somewhere valid but outside the filter.
            if (!hasFocused && (_isNothingFocused(beans) || this.getGui().contains(activeEl))) {
                // reset focus to the top of the container, and blur
                this.forceFocusOutOfContainer(true);
            }
        });
    }

    public afterGuiDetached(): void {
        this.executeFunctionIfExists('afterGuiDetached');
    }

    public onAnyFilterChanged(): void {
        this.executeFunctionIfExists('onAnyFilterChanged', (wrapper) =>
            this.executeOnWrapper(wrapper, 'onAnyFilterChanged')
        );
    }

    public onNewRowsLoaded(): void {
        this.executeFunctionIfExists('onNewRowsLoaded', (wrapper) => this.executeOnWrapper(wrapper, 'onNewRowsLoaded'));
    }

    public override destroy(): void {
        this.destroyChildren();
        this.hidePopup = undefined;

        super.destroy();
    }

    protected executeOnWrapper(_wrapper: TFilterWrapper, _name: 'onAnyFilterChanged' | 'onNewRowsLoaded'): void {
        // only for MultiFilter
    }

    private executeFunctionIfExists<T extends SharedFilterUi>(
        name: keyof T,
        executeOnHandler?: (wrapper: TFilterWrapper) => void
    ): void {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        forEachReverse(this.getFilterWrappers(), (wrapper) => {
            if (wrapper) {
                executeOnHandler?.(wrapper);
                this.executeFunctionIfExistsOnFilter(this.getFilterFromWrapper(wrapper) as T, name);
            }
        });
    }

    private executeFunctionIfExistsOnFilter<T extends SharedFilterUi>(
        filter: T,
        name: keyof T,
        ...params: any[]
    ): void {
        const func = filter[name];

        if (typeof func === 'function') {
            func.apply(filter, params);
        }
    }

    protected onFocusIn(e: FocusEvent): void {
        const lastActivatedMenuItem = this.lastActivatedMenuItem;
        if (lastActivatedMenuItem != null && !lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
            lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
    }
}
