import type {
    AgColumn,
    ContainerType,
    FilterDisplayParams,
    IAfterGuiAttachedParams,
    IComponent,
    IFilterComp,
    IFilterDef,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    RowNode,
} from 'ag-grid-community';
import {
    AgPromise,
    KeyCode,
    TabGuardComp,
    _focusInto,
    _getActiveDomElement,
    _getFilterDetails,
    _isNothingFocused,
    _loadTemplate,
} from 'ag-grid-community';

import { AgGroupComponent } from '../widgets/agGroupComponent';
import type { MenuItemActivatedEvent } from '../widgets/agMenuItemComponent';
import { AgMenuItemComponent } from '../widgets/agMenuItemComponent';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import type { MultiFilterEvaluator } from './multiFilterEvaluator';
import { forEachReverse, getFilterTitle, getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

export class MultiFilterUi
    extends TabGuardComp
    implements IComponent<IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>>
{
    public readonly filterType = 'multi' as const;

    private params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>;
    private filterDefs: IMultiFilterDef[] = [];
    private filters: (IFilterComp | null)[] = [];
    private guiDestroyFuncs: (() => void)[] = [];
    // this could be the accordion/sub menu element depending on the display type
    private filterGuis: (HTMLElement | null)[] = [];
    private lastOpenedInContainer?: ContainerType;
    private lastActivatedMenuItem: AgMenuItemComponent | null = null;
    private hidePopup?: () => void;

    constructor() {
        super(/* html */ `<div class="ag-multi-filter ag-menu-list-compact"></div>`);
    }

    public postConstruct() {
        this.initialiseTabGuard({
            onFocusIn: (e) => this.onFocusIn(e),
        });
    }

    public init(params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>): AgPromise<void> {
        this.params = params;
        this.filterDefs = getMultiFilterDefs(params);

        const filterPromises: AgPromise<IFilterComp | null>[] = this.filterDefs.map((filterDef, index) =>
            this.createFilter(filterDef, index)
        );

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return new AgPromise<void>((resolve) => {
            AgPromise.all(filterPromises).then((filters) => {
                this.filters = filters!;
                this.refreshGui('columnMenu').then(() => {
                    resolve();
                });
            });
        });
    }

    public refresh(params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>): boolean {
        this.params = params;
        this.filters.forEach((filter, index) => {
            // TODO - recheck typing
            filter?.refresh?.(this.updateParams(params, index) as any);
        });
        return true;
    }

    private refreshGui(container: ContainerType): AgPromise<void> {
        if (container === this.lastOpenedInContainer) {
            return AgPromise.resolve();
        }

        this.tabGuardFeature.removeAllChildrenExceptTabGuards();
        this.destroyChildren();

        return AgPromise.all(
            this.filters!.map((filter, index) => {
                if (!filter) {
                    return AgPromise.resolve(null);
                }
                const filterDef = this.filterDefs[index];
                const filterTitle = getFilterTitle(filter, filterDef);
                let filterGuiPromise: AgPromise<HTMLElement>;

                if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
                    // prevent sub-menu being used in tool panel
                    filterGuiPromise = this.insertFilterMenu(filter, filterTitle).then((menuItem) =>
                        menuItem!.getGui()
                    );
                } else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
                    // sub-menus should appear as groups in the tool panel
                    const group = this.insertFilterGroup(filter, filterTitle);

                    filterGuiPromise = AgPromise.resolve(group.getGui());
                } else {
                    // display inline
                    filterGuiPromise = AgPromise.resolve(filter.getGui());
                }

                return filterGuiPromise;
            })
        ).then((filterGuis) => {
            filterGuis!.forEach((filterGui, index) => {
                if (filterGui == null) {
                    return;
                }
                if (index > 0) {
                    this.appendChild(_loadTemplate(/* html */ `<div class="ag-filter-separator"></div>`));
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

    private insertFilterMenu(filter: IFilterComp, name: string): AgPromise<AgMenuItemComponent> {
        const menuItem = this.createBean(new AgMenuItemComponent());
        return menuItem
            .init({
                menuItemDef: {
                    name,
                    subMenu: [],
                    cssClasses: ['ag-multi-filter-menu-item'],
                    menuItem: AgMenuItemRenderer,
                    menuItemParams: {
                        cssClassPrefix: 'ag-compact-menu-option',
                        isCompact: true,
                    },
                },
                level: 0,
                isAnotherSubMenuOpen: () => false,
                childComponent: filter,
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

    private insertFilterGroup(filter: IFilterComp, title: string): AgGroupComponent {
        const group = this.createBean(
            new AgGroupComponent({
                title,
                cssIdentifier: 'multi-filter',
            })
        );

        this.guiDestroyFuncs.push(() => this.destroyBean(group));

        group.addItem(filter.getGui());
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

    public getLastActiveFilterIndex(): number | null {
        return (this.params.getEvaluator() as MultiFilterEvaluator)?.getLastActiveFilterIndex?.() ?? null;
    }

    public getChildFilterInstance(index: number): IFilterComp | undefined {
        return this.filters[index] ?? undefined;
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
            const { filterDefs, filters, filterGuis, beans } = this;
            // don't want to focus later if focus suppressed
            let hasFocused = !!suppressFocus;
            if (filterDefs) {
                forEachReverse(filterDefs, (filterDef, index) => {
                    const isFirst = index === 0;
                    const notInlineDisplayType = filterDef.display && filterDef.display !== 'inline';
                    const suppressFocusForFilter = suppressFocus || !isFirst || notInlineDisplayType;
                    const afterGuiAttachedParams = { ...(params ?? {}), suppressFocus: suppressFocusForFilter };
                    const filter = filters?.[index];
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
        this.executeFunctionIfExists('onAnyFilterChanged');
    }

    public onNewRowsLoaded(): void {
        this.executeFunctionIfExists('onNewRowsLoaded');
    }

    public override destroy(): void {
        this.filters.forEach((filter) => this.destroyBean(filter));

        this.filters.length = 0;
        this.destroyChildren();
        this.hidePopup = undefined;

        super.destroy();
    }

    private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]): void {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        forEachReverse(this.filters, (filter) => {
            this.executeFunctionIfExistsOnFilter(filter as T, name, params);
        });
    }

    private executeFunctionIfExistsOnFilter<T extends IFilterComp>(filter: T, name: keyof T, ...params: any[]): void {
        const func = filter[name];

        if (typeof func === 'function') {
            func.apply(filter, params);
        }
    }

    private createFilter(filterDef: IFilterDef, index: number): AgPromise<IFilterComp | null> {
        const userCompFactory = this.beans.userCompFactory;

        const filterParams = this.updateParams(this.params, index);

        // TODO - recheck typing
        const compDetails = _getFilterDetails(userCompFactory, filterDef, filterParams as any, 'agTextColumnFilter');
        if (!compDetails) {
            return AgPromise.resolve(null);
        }
        return compDetails.newAgStackInstance();
    }

    private updateParams(
        params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>,
        index: number
    ): FilterDisplayParams {
        const { doesRowPassOtherFilter, model, onModelChange } = params;
        return {
            ...params,
            doesRowPassOtherFilter: (node: RowNode) =>
                doesRowPassOtherFilter(node) && this.doesOtherFilterPass(node, index),
            model: model?.filterModels?.[index] ?? null,
            onModelChange: (childModel, additionalEventAttributes) => {
                const { filters, params } = this;
                const newModel = getUpdatedMultiFilterModel(params.model, filters.length, childModel, index);
                this.updateActiveList(index, childModel);
                onModelChange(newModel, additionalEventAttributes);
                filters.forEach((filter, otherIndex) => {
                    if (index !== otherIndex && typeof filter?.onAnyFilterChanged === 'function') {
                        filter.onAnyFilterChanged();
                    }
                });
            },
        };
    }

    private doesOtherFilterPass(node: RowNode, index: number): boolean {
        const {
            beans,
            params: { column, model },
        } = this;
        const evaluator = beans.colFilter?.getEvaluator(column as AgColumn);
        return (
            !evaluator ||
            evaluator.doesFilterPass({
                node,
                data: node.data,
                model: model?.filterModels?.[index] ?? null,
            })
        );
    }

    private updateActiveList(index: number, childModel: any): void {
        const evaluator = this.params.getEvaluator();
        if ((evaluator as MultiFilterEvaluator)?.updateActiveList) {
            (evaluator as MultiFilterEvaluator).updateActiveList(index, childModel);
        }
    }

    protected onFocusIn(e: FocusEvent): void {
        const lastActivatedMenuItem = this.lastActivatedMenuItem;
        if (lastActivatedMenuItem != null && !lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
            lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
    }

    public getModelAsString(model: IMultiFilterModel): string {
        return this.params.getEvaluator()?.getModelAsString?.(model) ?? '';
    }
}
