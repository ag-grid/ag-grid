import {
    ProvidedFilter,
    AgPromise,
    ProvidedFilterModel,
    IDoesFilterPassParams,
    IAfterGuiAttachedParams,
    IFilterComp,
    Autowired,
    UserComponentFactory,
    FilterManager,
    Column,
    IFilterDef,
    IFilterParams,
    RowNode,
    AgGroupComponent,
    ContainerType,
    TabGuardComp,
    _,
    PostConstruct
} from '@ag-grid-community/core';
import { MenuItemComponent, MenuItemActivatedEvent } from '@ag-grid-enterprise/menu';

export interface IMultiFilterDef extends IFilterDef {
    /** 
     * Configures how the filter is shown in the Multi Filter.
     * Default: `inline`
     */
    display?: 'inline' | 'accordion' | 'subMenu';
    /**
     * The title to be used when a filter is displayed inside a sub-menu or accordion.
     */
    title?: string;
}

export interface IMultiFilterParams extends IFilterParams {
    /** An array of filter definition objects. */
    filters?: IMultiFilterDef[];
    /** Defaults to false. If true, all UI inputs managed by this filter are for display only, and
     * the filter can only be affected by API calls. Does NOT affect child filters, they need to be
     * individually configured with `readOnly` where applicable. */
    readOnly?: boolean;
}

export interface IMultiFilterModel {
    /** Multi filter type.  */
    filterType?: 'multi';
    /**
     * Child filter models in the same order as the filters are specified in `filterParams`.
     */
    filterModels: any[] | null;
}

export class MultiFilter extends TabGuardComp implements IFilterComp {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private params: IMultiFilterParams;
    private filterDefs: IMultiFilterDef[] = [];
    private filters: IFilterComp[] | null = [];
    private guiDestroyFuncs: (() => void)[] = [];
    private column: Column;
    private filterChangedCallback: ((additionalEventAttributes?: any) => void) | null;
    private lastOpenedInContainer?: ContainerType;
    private activeFilterIndices: number[] = [];
    private lastActivatedMenuItem: MenuItemComponent | null = null;

    private afterFiltersReadyFuncs: (() => void)[] = [];

    constructor() {
        super(/* html */`<div class="ag-multi-filter ag-menu-list-compact"></div>`);
    }

    @PostConstruct
    private postConstruct() {
        this.initialiseTabGuard({
            onFocusIn: e => this.onFocusIn(e)
        });
    }

    public static getFilterDefs(params: IMultiFilterParams): IMultiFilterDef[] {
        const { filters } = params;

        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    }

    public init(params: IMultiFilterParams): AgPromise<void> {
        this.params = params;
        this.filterDefs = MultiFilter.getFilterDefs(params);

        const { column, filterChangedCallback } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;

        const filterPromises: AgPromise<IFilterComp>[] = [];

        _.forEach(this.filterDefs, (filterDef, index) => {
            const filterPromise = this.createFilter(filterDef, index);

            if (filterPromise != null) {
                filterPromises.push(filterPromise);
            }
        });

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return AgPromise
            .all(filterPromises)
            .then(filters => {
                this.filters = filters as IFilterComp[];
                this.refreshGui('columnMenu');

                this.afterFiltersReadyFuncs.forEach(f => f());
                this.afterFiltersReadyFuncs.length = 0;
            });
    }

    private refreshGui(container: ContainerType): void {
        if (container === this.lastOpenedInContainer) { return; }

        this.removeAllChildrenExceptTabGuards();
        this.destroyChildren();

        _.forEach(this.filters!, (filter, index) => {
            if (index > 0) {
                this.appendChild(_.loadTemplate(/* html */`<div class="ag-filter-separator"></div>`));
            }

            const filterDef = this.filterDefs[index];
            const filterTitle = this.getFilterTitle(filter, filterDef);
            let filterGui: HTMLElement;

            if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
                // prevent sub-menu being used in tool panel
                const menuItem = this.insertFilterMenu(filter, filterTitle);

                filterGui = menuItem.getGui();

            } else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
                // sub-menus should appear as groups in the tool panel
                const group = this.insertFilterGroup(filter, filterTitle);

                filterGui = group.getGui();
            } else {
                // display inline
                filterGui = filter.getGui();
            }

            this.appendChild(filterGui);
        });

        this.lastOpenedInContainer = container;
    }

    private getFilterTitle(filter: IFilterComp, filterDef: IMultiFilterDef): string {
        if (filterDef.title != null) {
            return filterDef.title;
        }

        const filterWithoutType = filter as any;

        return typeof filterWithoutType.getFilterTitle === 'function' ? filterWithoutType.getFilterTitle() : 'Filter';
    }

    private destroyChildren() {
        _.forEach(this.guiDestroyFuncs, func => func());
        this.guiDestroyFuncs.length = 0;
    }

    private insertFilterMenu(filter: IFilterComp, name: string): MenuItemComponent {
        const menuItem = this.createBean(new MenuItemComponent({
            name,
            subMenu: filter,
            cssClasses: ['ag-multi-filter-menu-item'],
            isCompact: true,
            isAnotherSubMenuOpen: () => false,
        }));

        menuItem.setParentComponent(this);

        this.guiDestroyFuncs.push(() => this.destroyBean(menuItem));

        this.addManagedListener(menuItem, MenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, (event: MenuItemActivatedEvent) => {
            if (this.lastActivatedMenuItem && this.lastActivatedMenuItem !== event.menuItem) {
                this.lastActivatedMenuItem.deactivate();
            }

            this.lastActivatedMenuItem = event.menuItem;
        });

        menuItem.addGuiEventListener('focusin', () => menuItem.activate());
        menuItem.addGuiEventListener('focusout', () => {
            if (!menuItem.isSubMenuOpen()) {
                menuItem.deactivate();
            }
        });

        return menuItem;
    }

    private insertFilterGroup(filter: IFilterComp, title: string): AgGroupComponent {
        const group = this.createBean(new AgGroupComponent({
            title,
            cssIdentifier: 'multi-filter',
        }));

        this.guiDestroyFuncs.push(() => this.destroyBean(group));

        group.addItem(filter.getGui());
        group.toggleGroupExpand(false);

        if (filter.afterGuiAttached) {
            const params: IAfterGuiAttachedParams = { container: this.lastOpenedInContainer!, suppressFocus: true };

            group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, () => filter.afterGuiAttached!(params));
        }

        return group;
    }

    public isFilterActive(): boolean {
        return _.some(this.filters!, filter => filter.isFilterActive());
    }

    public getLastActiveFilterIndex(): number | null {
        return this.activeFilterIndices.length > 0 ? this.activeFilterIndices[this.activeFilterIndices.length - 1] : null;
    }

    public doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean {
        let rowPasses = true;

        this.filters!.forEach(filter => {
            if (!rowPasses || filter === filterToSkip || !filter.isFilterActive()) { return; }

            rowPasses = filter.doesFilterPass(params);
        });

        return rowPasses;
    }

    private getFilterType(): 'multi' {
        return 'multi';
    }

    public getModelFromUi(): IMultiFilterModel | null {
        const model: IMultiFilterModel = {
            filterType: this.getFilterType(),
            filterModels: _.map(this.filters!, filter => {
                const providedFilter = filter as ProvidedFilter<IMultiFilterModel>;

                if (typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }

                return null;
            })
        };

        return model;
    }

    public getModel(): ProvidedFilterModel | null {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: IMultiFilterModel = {
            filterType: this.getFilterType(),
            filterModels: _.map(this.filters!, filter => {
                if (filter.isFilterActive()) {
                    return filter.getModel();
                }

                return null;
            })
        };

        return model;
    }

    public setModel(model: IMultiFilterModel | null): AgPromise<void> {
        const setFilterModel = (filter: IFilterComp, filterModel: any) => {
            return new AgPromise<void>(resolve => {
                const promise = filter.setModel(filterModel);
                promise ? promise.then(() => resolve()) : resolve();
            });
        };

        let promises: AgPromise<void>[] = [];

        if (model == null) {
            promises = _.map(this.filters!, (filter: IFilterComp, index: number) => {
                const res = setFilterModel(filter, null);
                this.updateActiveList(index);
                return res;
            })!;
        } else {
            _.forEach(this.filters!, (filter, index) => {
                const filterModel = model.filterModels!.length > index ? model.filterModels![index] : null;
                const res = setFilterModel(filter, filterModel);
                promises.push(res);
                this.updateActiveList(index);
            });
        }

        return AgPromise.all(promises).then(() => { });
    }

    public getChildFilterInstance(index: number): IFilterComp {
        return this.filters![index];
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params) {
            this.refreshGui(params.container!);
        }

        const { filters } = this.params;
        const suppressFocus = filters && _.some(filters, filter => filter.display! && filter.display !== 'inline');

        this.executeFunctionIfExists('afterGuiAttached', { ...params || {}, suppressFocus });
        const activeEl = document.activeElement;

        // if suppress focus is true, we might run into two scenarios: 
        // 1 - we are loading the filter for the first time and the component isn't ready, 
        //     which means the document will have focus.
        // 2 - The focus will be somewhere inside the component due to auto focus
        // In both cases we need to force the focus somewhere valid but outside the filter.
        if (suppressFocus && (activeEl === document.body || this.getGui().contains(activeEl))) {
            // reset focus to the top of the container, and blur
            this.forceFocusOutOfContainer(true);
        }
    }

    public onAnyFilterChanged(): void {
        this.executeFunctionIfExists('onAnyFilterChanged');
    }

    public onNewRowsLoaded(): void {
        this.executeFunctionIfExists('onNewRowsLoaded');
    }

    public destroy(): void {
        _.forEach(this.filters!, filter => {
            filter.setModel(null);
            this.destroyBean(filter);
        });

        this.filters!.length = 0;
        this.destroyChildren();

        super.destroy();
    }

    private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]) {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        _.forEachReverse(this.filters!, filter => {
            const func = (filter as T)[name];

            if (typeof func === 'function') {
                func.apply(filter, params);
            }
        });
    }

    private createFilter(filterDef: IFilterDef, index: number): AgPromise<IFilterComp> | null {
        const { filterModifiedCallback, doesRowPassOtherFilter } = this.params;

        let filterInstance: IFilterComp;

        const filterParams: IFilterParams = {
            ...this.filterManager.createFilterParams(this.column, this.column.getColDef()),
            filterModifiedCallback,
            filterChangedCallback: additionalEventAttributes => {
                this.executeWhenAllFiltersReady(() => this.filterChanged(index, additionalEventAttributes));
            },
            doesRowPassOtherFilter: (node: RowNode) =>
                doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, filterInstance),
        };

        const filterPromise = this.userComponentFactory.newFilterComponent(filterDef, filterParams, 'agTextColumnFilter');

        if (filterPromise != null) {
            return filterPromise.then(filter => filterInstance = filter!);
        }

        return filterPromise;
    }

    private executeWhenAllFiltersReady(action: () => void): void {
        if (this.filters && this.filters.length > 0) {
            action();
        } else {
            this.afterFiltersReadyFuncs.push(action);
        }
    }

    private updateActiveList(index: number): void {
        const changedFilter = this.filters![index];

        _.removeFromArray(this.activeFilterIndices, index);

        if (changedFilter.isFilterActive()) {
            this.activeFilterIndices.push(index);
        }
    }

    private filterChanged(index: number, additionalEventAttributes: any): void {
        this.updateActiveList(index);

        this.filterChangedCallback!(additionalEventAttributes);
        const changedFilter = this.filters![index];

        _.forEach(this.filters!, filter => {
            if (filter === changedFilter) { return; }

            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    }

    protected onFocusIn(e: FocusEvent): boolean {
        if (this.lastActivatedMenuItem != null && !this.lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
            this.lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }

        return true;
    }
}
