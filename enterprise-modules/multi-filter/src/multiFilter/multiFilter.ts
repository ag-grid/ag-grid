import {
    ProvidedFilter,
    Promise,
    ProvidedFilterModel,
    IDoesFilterPassParams,
    IAfterGuiAttachedParams,
    IFilterComp,
    Autowired,
    UserComponentFactory,
    FilterManager,
    Column,
    IFilterDef,
    _,
    IFilterParams,
    RowNode,
    AgGroupComponent,
    ContainerType,
    ManagedFocusComponent,
} from '@ag-grid-community/core';
import { MenuItemComponent, MenuItemActivatedEvent } from '@ag-grid-enterprise/menu';

export interface IMultiFilterDef extends IFilterDef {
    display?: 'inline' | 'accordion' | 'subMenu';
    title?: string;
}

export interface IMultiFilterParams extends IFilterParams {
    filters?: IMultiFilterDef[];
}

export interface IMultiFilterModel {
    filterType: string;
    filterModels: any[];
}

export class MultiFilter extends ManagedFocusComponent implements IFilterComp {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private params: IMultiFilterParams;
    private filterDefs: IMultiFilterDef[] = [];
    private filters: IFilterComp[] = [];
    private guiDestroyFuncs: (() => void)[] = [];
    private column: Column;
    private filterChangedCallback: () => void;
    private lastOpenedInContainer?: ContainerType;
    private activeFilterIndices: number[] = [];
    private lastActivatedMenuItem: MenuItemComponent | null = null;

    constructor() {
        super(/* html */`<div class="ag-multi-filter ag-menu-list-compact"></div>`);
    }

    public static getFilterDefs(params: IMultiFilterParams): IMultiFilterDef[] {
        const { filters } = params;

        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    }

    public init(params: IMultiFilterParams): Promise<void> {
        this.params = params;
        this.filterDefs = MultiFilter.getFilterDefs(params);

        const { column, filterChangedCallback } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;

        const filterPromises: Promise<IFilterComp>[] = [];

        _.forEach(this.filterDefs, (filterDef, index) => {
            const filterPromise = this.createFilter(filterDef, index);

            if (filterPromise != null) {
                filterPromises.push(filterPromise);
            }
        });

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return Promise.all(filterPromises).then(filters => { this.filters = filters; this.refreshGui('columnMenu'); });
    }

    private refreshGui(container: ContainerType): void {
        if (container === this.lastOpenedInContainer) { return; }

        this.clearGui();
        this.destroyChildren();

        _.forEach(this.filters, (filter, index) => {
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
            const params: IAfterGuiAttachedParams = { container: this.lastOpenedInContainer, suppressFocus: true };

            group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, () => filter.afterGuiAttached(params));
        }

        return group;
    }

    public isFilterActive(): boolean {
        return _.some(this.filters, filter => filter.isFilterActive());
    }

    public getLastActiveFilterIndex(): number | null {
        return this.activeFilterIndices.length > 0 ? this.activeFilterIndices[this.activeFilterIndices.length - 1] : null;
    }

    public doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean {
        let rowPasses = true;

        this.filters.forEach(filter => {
            if (!rowPasses || filter === filterToSkip || !filter.isFilterActive()) { return; }

            rowPasses = filter.doesFilterPass(params);
        });

        return rowPasses;
    }

    private getFilterType(): string {
        return 'multi';
    }

    public getModelFromUi(): IMultiFilterModel {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: IMultiFilterModel = {
            filterType: this.getFilterType(),
            filterModels: _.map(this.filters, filter => {
                const providedFilter = filter as ProvidedFilter;

                if (filter.isFilterActive() && typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }

                return null;
            })
        };

        return model;
    }

    public getModel(): ProvidedFilterModel {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: IMultiFilterModel = {
            filterType: this.getFilterType(),
            filterModels: _.map(this.filters, filter => {
                if (filter.isFilterActive()) {
                    return filter.getModel();
                }

                return null;
            })
        };

        return model;
    }

    public setModel(model: IMultiFilterModel): Promise<void> {
        const setFilterModel = (filter: IFilterComp, model: any) => {
            return new Promise<void>(resolve => {
                const promise = filter.setModel(model);

                if (promise == null) {
                    resolve();
                } else {
                    (promise as Promise<void>).then(() => resolve());
                }
            });
        };

        let promises: Promise<void>[] = [];

        if (model == null) {
            promises = _.map(this.filters, filter => setFilterModel(filter, null));
        } else {
            _.forEach(this.filters, (filter, index) => {
                const filterModel = model.filterModels.length > index ? model.filterModels[index] : null;

                promises.push(setFilterModel(filter, filterModel));
            });
        }

        return Promise.all(promises).then(() => { });
    }

    public getChildFilterInstance(index: number): IFilterComp {
        return this.filters[index];
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        if (params) {
            this.refreshGui(params.container);
        }

        const { filters } = this.params;
        const suppressFocus = filters && _.some(filters, filter => filter.display && filter.display !== 'inline');

        this.executeFunctionIfExists('afterGuiAttached', { ...params || {}, suppressFocus });

        if (suppressFocus) {
            // reset focus to the top of the container, and blur
            this.focusInnerElement();
            (document.activeElement as HTMLElement).blur();
        }
    }

    public onAnyFilterChanged(): void {
        this.executeFunctionIfExists('onAnyFilterChanged');
    }

    public onNewRowsLoaded(): void {
        this.executeFunctionIfExists('onNewRowsLoaded');
    }

    public destroy(): void {
        _.forEach(this.filters, filter => {
            filter.setModel(null);
            this.destroyBean(filter);
        });

        this.filters.length = 0;
        this.destroyChildren();

        super.destroy();
    }

    private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]) {
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        _.forEachReverse(this.filters, filter => {
            const func = (filter as T)[name];

            if (typeof func === 'function') {
                func.apply(filter, params);
            }
        });
    }

    private createFilter(filterDef: IFilterDef, index: number): Promise<IFilterComp> {
        const { filterModifiedCallback, doesRowPassOtherFilter } = this.params;

        let filterInstance: IFilterComp;

        const filterParams: IFilterParams =
        {
            ...this.filterManager.createFilterParams(this.column, this.column.getColDef()),
            filterModifiedCallback,
            filterChangedCallback: () => this.filterChanged(index),
            doesRowPassOtherFilter: (node: RowNode) =>
                doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, filterInstance),
        };

        const filterPromise = this.userComponentFactory.newFilterComponent(filterDef, filterParams, 'agTextColumnFilter');

        if (filterPromise != null) {
            return filterPromise.then(filter => filterInstance = filter);
        }

        return filterPromise;
    }

    private filterChanged(index: number): void {
        const changedFilter = this.filters[index];

        _.removeFromArray(this.activeFilterIndices, index);

        if (changedFilter.isFilterActive()) {
            this.activeFilterIndices.push(index);
        }

        this.filterChangedCallback();

        _.forEach(this.filters, filter => {
            if (filter === changedFilter) { return; }

            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    }

    protected onFocusIn(e: FocusEvent): void {
        if (this.lastActivatedMenuItem != null && !this.lastActivatedMenuItem.getGui().contains(e.target as HTMLElement)) {
            this.lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
    }
}
