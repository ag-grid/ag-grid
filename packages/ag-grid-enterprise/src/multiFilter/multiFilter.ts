import type {
    AgColumn,
    ContainerType,
    FilterDisplayParams,
    FilterEvaluator,
    FilterEvaluatorParams,
    IAfterGuiAttachedParams,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterDef,
    IMultiFilter,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    MultiFilterParams,
    ProvidedFilterModel,
    RowNode,
} from 'ag-grid-community';
import {
    AgPromise,
    KeyCode,
    ProvidedFilter,
    TabGuardComp,
    _focusInto,
    _getActiveDomElement,
    _isNothingFocused,
    _loadTemplate,
    _refreshEvaluatorAndUi,
    _removeFromArray,
    _setAriaRole,
} from 'ag-grid-community';

import { AgGroupComponent } from '../widgets/agGroupComponent';
import type { MenuItemActivatedEvent } from '../widgets/agMenuItemComponent';
import { AgMenuItemComponent } from '../widgets/agMenuItemComponent';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
import { forEachReverse, getFilterTitle, getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

interface MultiFilterWrapper {
    filter: IFilterComp;
    /** only set for evaluators */
    filterParams?: FilterDisplayParams;
    evaluator?: FilterEvaluator;
    evaluatorParams?: FilterEvaluatorParams;
    /** only set for evaluators */
    model?: any;
}

/** temporary type until `MultiFilterParams` is updated as breaking change */
type MultiFilterDisplayParams = IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>;

export class MultiFilter extends TabGuardComp implements IFilterComp, IMultiFilter {
    public readonly filterType = 'multi' as const;

    private params: MultiFilterDisplayParams;
    private filterDefs: IMultiFilterDef[] = [];
    private wrappers: (MultiFilterWrapper | null)[] = [];
    private guiDestroyFuncs: (() => void)[] = [];
    // this could be the accordion/sub menu element depending on the display type
    private filterGuis: (HTMLElement | null)[] = [];
    private filterChangedCallback: ((additionalEventAttributes?: any) => void) | null;
    private lastOpenedInContainer?: ContainerType;
    private activeFilterIndices: number[] = [];
    private lastActivatedMenuItem: AgMenuItemComponent | null = null;
    private hidePopup?: () => void;

    private afterFiltersReadyFuncs: (() => void)[] = [];

    constructor() {
        super(/* html */ `<div class="ag-multi-filter ag-menu-list-compact"></div>`);
    }

    public postConstruct() {
        this.initialiseTabGuard({
            onFocusIn: (e) => this.onFocusIn(e),
        });
    }

    public init(params: MultiFilterParams): AgPromise<void> {
        this.params = params as unknown as MultiFilterDisplayParams;
        this.filterDefs = getMultiFilterDefs(params);

        const initialModel = this.beans.colFilter!.getModelFromInitialState(params.column);

        const { filterChangedCallback } = params;

        this.filterChangedCallback = filterChangedCallback;

        const filterPromises = this.filterDefs.map((filterDef, index) =>
            this.createFilter(filterDef, index, initialModel)
        );

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return new AgPromise<void>((resolve) => {
            AgPromise.all(filterPromises).then((wrappers) => {
                this.wrappers = wrappers!;
                this.refreshGui('columnMenu').then(() => {
                    resolve();
                });
            });
        }).then(() => {
            this.afterFiltersReadyFuncs.forEach((f) => f());
            this.afterFiltersReadyFuncs.length = 0;
        });
    }

    private refreshGui(container: ContainerType): AgPromise<void> {
        if (container === this.lastOpenedInContainer) {
            return AgPromise.resolve();
        }

        this.tabGuardFeature.removeAllChildrenExceptTabGuards();
        this.destroyChildren();

        return AgPromise.all(
            this.wrappers.map((wrapper, index) => {
                if (!wrapper) {
                    return AgPromise.resolve(null);
                }
                const filter = wrapper.filter;
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
                if (!filterGui) {
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
        const eGui = filter.getGui();
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

    public isFilterActive(): boolean {
        return this.wrappers.some((wrapper) => {
            if (!wrapper) {
                return false;
            }
            const { filter, evaluator, model } = wrapper;
            if (evaluator) {
                return model != null;
            }
            return filter.isFilterActive();
        });
    }

    public getLastActiveFilterIndex(): number | null {
        const activeFilterIndices = this.activeFilterIndices;
        return activeFilterIndices.length > 0 ? activeFilterIndices[activeFilterIndices.length - 1] : null;
    }

    public doesFilterPass(params: IDoesFilterPassParams, indexToSkip?: number): boolean {
        return this.wrappers.every((wrapper, index) => {
            if (!wrapper || (indexToSkip != null && index === indexToSkip)) {
                return true;
            }
            const { evaluator, filter, model } = wrapper;
            if (evaluator && model != null) {
                return evaluator.doesFilterPass({
                    ...params,
                    model,
                });
            }
            return !filter.isFilterActive() || filter.doesFilterPass(params);
        });
    }

    public getModelFromUi(): IMultiFilterModel | null {
        const model: IMultiFilterModel = {
            filterType: this.filterType,
            filterModels: this.wrappers.map((wrapper) => {
                if (!wrapper) {
                    return null;
                }
                const providedFilter = wrapper.filter as ProvidedFilter<
                    IMultiFilterModel,
                    unknown,
                    MultiFilterDisplayParams
                >;

                if (typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }

                return null;
            }),
        };

        return model;
    }

    public getModel(): ProvidedFilterModel | null {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: IMultiFilterModel = {
            filterType: this.filterType,
            filterModels: this.wrappers.map((wrapper) => {
                if (!wrapper) {
                    return null;
                }
                const { filter, evaluator, model } = wrapper;
                if (evaluator) {
                    return model;
                }
                return filter.isFilterActive() ? filter.getModel() : null;
            }),
        };

        return model;
    }

    public setModel(model: IMultiFilterModel | null): AgPromise<void> {
        const setFilterModel = (filter: IFilterComp, filterModel: any) => {
            return new AgPromise<void>((resolve) => {
                const promise = filter.setModel(filterModel);
                promise ? promise.then(() => resolve()) : resolve();
            });
        };

        const promises: AgPromise<void>[] = [];

        this.wrappers.forEach((wrapper, index) => {
            if (!wrapper) {
                return;
            }
            const modelForFilter = model?.filterModels?.[index] ?? null;
            const { filter, filterParams, evaluator, evaluatorParams } = wrapper;
            if (evaluator) {
                promises.push(
                    _refreshEvaluatorAndUi(
                        () => AgPromise.resolve({ filter: filter as any, filterParams: filterParams as any }),
                        evaluator,
                        evaluatorParams!,
                        modelForFilter,
                        { model: null }, // TODO
                        'api'
                    ).then(() => {
                        this.updateActiveListForEvaluator(index, modelForFilter);
                    })
                );
            } else {
                promises.push(
                    setFilterModel(filter, modelForFilter).then(() => {
                        this.updateActiveListForFilter(index, filter);
                    })
                );
            }
        });
        return AgPromise.all(promises).then(() => {});
    }

    public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        let result = false;

        this.wrappers.forEach((wrapper) => {
            if (wrapper) {
                const filter = wrapper.filter;
                if (filter instanceof ProvidedFilter) {
                    result = filter.applyModel(source) || result;
                }
            }
        });

        return result;
    }

    public getChildFilterInstance(index: number): IFilterComp | undefined {
        return this.wrappers[index]?.filter;
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
            const { filterDefs, wrappers, filterGuis, beans } = this;
            // don't want to focus later if focus suppressed
            let hasFocused = !!suppressFocus;
            if (filterDefs) {
                forEachReverse(filterDefs, (filterDef, index) => {
                    const isFirst = index === 0;
                    const notInlineDisplayType = filterDef.display && filterDef.display !== 'inline';
                    const suppressFocusForFilter = suppressFocus || !isFirst || notInlineDisplayType;
                    const afterGuiAttachedParams = { ...(params ?? {}), suppressFocus: suppressFocusForFilter };
                    const filter = wrappers?.[index]?.filter;
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
        this.wrappers.forEach((wrapper) => {
            this.destroyBean(wrapper?.filter);
            this.destroyBean(wrapper?.evaluator);
        });

        this.wrappers.length = 0;
        this.destroyChildren();
        this.hidePopup = undefined;

        super.destroy();
    }

    private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]): void {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        forEachReverse(this.wrappers, (wrapper) => {
            if (wrapper) {
                this.executeFunctionIfExistsOnFilter(wrapper.filter as T, name, params);
            }
        });
    }

    private executeFunctionIfExistsOnFilter<T extends IFilterComp>(filter: T, name: keyof T, ...params: any[]): void {
        const func = filter[name];

        if (typeof func === 'function') {
            func.apply(filter, params);
        }
    }

    private createFilter(
        filterDef: IFilterDef,
        index: number,
        initialModel: IMultiFilterModel | null
    ): AgPromise<MultiFilterWrapper | null> {
        const column = this.params.column as AgColumn;

        let initialModelForFilter: any = null;

        const { compDetails, evaluator, evaluatorParams, createFilterUi } = this.beans.colFilter!.createFilterInstance(
            column,
            filterDef,
            'agTextColumnFilter',
            (defaultParams, isEvaluator) => {
                const updatedParams = {
                    ...defaultParams,
                    filterChangedCallback: isEvaluator
                        ? () => {}
                        : (additionalEventAttributes?: any) => {
                              this.executeWhenAllFiltersReady(() =>
                                  this.onFilterModelChanged(index, additionalEventAttributes)
                              );
                          },
                    doesRowPassOtherFilter: (node: RowNode) =>
                        defaultParams.doesRowPassOtherFilter(node) &&
                        this.doesFilterPass({ node, data: node.data }, index),
                };
                if (isEvaluator) {
                    const displayParams = updatedParams as unknown as FilterDisplayParams;
                    initialModelForFilter = initialModel?.filterModels?.[index] ?? null;
                    displayParams.model = initialModelForFilter;
                    displayParams.onModelChange = (model, additionalEventAttributes?: any) => {
                        const wrapper = this.wrappers[index];
                        if (!wrapper) {
                            return;
                        }
                        _refreshEvaluatorAndUi(
                            () =>
                                AgPromise.resolve({
                                    filter: wrapper.filter as any,
                                    filterParams: wrapper.filterParams as any,
                                }),
                            wrapper.evaluator!,
                            wrapper.evaluatorParams!,
                            model,
                            { model: null }, // TODO
                            'ui'
                        ).then(() => {
                            wrapper.model = model;
                            this.onEvaluatorModelChanged(index, model, additionalEventAttributes);
                        });
                    };
                }
                return updatedParams;
            }
        );

        if (!createFilterUi) {
            return AgPromise.resolve(null);
        }

        return createFilterUi().then((filter) => {
            if (!evaluator) {
                return { filter: filter! };
            }
            const onModelChange = evaluatorParams!.onModelChange;
            evaluator.init?.({
                ...evaluatorParams!,
                model: initialModelForFilter,
                onModelChange: (newModel, additionalEventAttributes) =>
                    onModelChange(
                        getUpdatedMultiFilterModel(this.params.model, this.wrappers.length, newModel, index),
                        additionalEventAttributes
                    ),
            });
            return {
                filter: filter!,
                filterParams: compDetails?.params,
                evaluator,
                evaluatorParams,
                model: initialModelForFilter,
            };
        });
    }

    private executeWhenAllFiltersReady(action: () => void): void {
        if ((this.wrappers?.length ?? 0) > 0) {
            action();
        } else {
            this.afterFiltersReadyFuncs.push(action);
        }
    }

    private updateActiveListForFilter(index: number, filter?: IFilterComp): void {
        this.updateActiveList(index, () => filter?.isFilterActive());
    }

    private updateActiveListForEvaluator(index: number, model?: any): void {
        this.updateActiveList(index, () => model != null);
    }

    private updateActiveList(index: number, isActive: () => boolean | undefined): void {
        const activeFilterIndices = this.activeFilterIndices;
        _removeFromArray(this.activeFilterIndices, index);

        if (isActive()) {
            activeFilterIndices.push(index);
        }
    }

    /** Only called for non-evaluators */
    private onFilterModelChanged(index: number, additionalEventAttributes: any): void {
        this.updateActiveListForFilter(index, this.wrappers[index]?.filter);

        this.filterChanged(index, additionalEventAttributes);
    }

    private onEvaluatorModelChanged(index: number, model: any, additionalEventAttributes?: any): void {
        this.updateActiveListForEvaluator(index, model);

        this.filterChanged(index, additionalEventAttributes);
    }

    private filterChanged(index: number, additionalEventAttributes: any): void {
        this.filterChangedCallback!(additionalEventAttributes);

        this.wrappers.forEach((wrapper, childIndex) => {
            if (index === childIndex || !wrapper) {
                return;
            }

            const filter = wrapper.filter;

            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    }

    protected onFocusIn(e: FocusEvent): void {
        const lastActivatedMenuItem = this.lastActivatedMenuItem;
        if (lastActivatedMenuItem != null && !lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
            lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
    }

    public getModelAsString(model: IMultiFilterModel): string {
        if (!model?.filterModels?.length) {
            return '';
        }
        const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
        const activeFilter = this.wrappers[lastActiveIndex]?.filter;
        return activeFilter?.getModelAsString?.(model.filterModels[lastActiveIndex]) ?? '';
    }
}
