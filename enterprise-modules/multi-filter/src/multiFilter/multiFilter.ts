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
    Component,
    IFilterParams,
} from '@ag-grid-community/core';

export interface MultiFilterParams extends IFilterParams {
    filters?: IFilterDef[];
    combineFilters?: boolean;
}

export interface MultiFilterModel {
    filterType: string;
    filterModels: any[];
}

export class MultiFilter extends Component implements IFilterComp {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private params: MultiFilterParams;
    private filters: IFilterComp[] = [];
    private activeFilters = new Set<IFilterComp>();
    private column: Column;
    private filterChangedCallback: () => void;
    private combineFilters: boolean;

    constructor() {
        super('<div class="multi-filter"></div>');
    }

    public static getFilterDefs(params: MultiFilterParams): IFilterDef[] {
        const { filters } = params;

        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    }

    public init(params: MultiFilterParams): Promise<void> {
        this.params = params;

        const { column, filterChangedCallback, combineFilters } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;
        this.combineFilters = !!combineFilters;

        const filterPromises: Promise<IFilterComp>[] = [];

        _.forEach(MultiFilter.getFilterDefs(params), (filterDef, index) => {
            const filterPromise = this.createFilter(filterDef, index);

            if (filterPromise != null) {
                filterPromises.push(filterPromise);
            }
        });

        return Promise.all(filterPromises).then(filters => {
            _.forEach(filters, (filter, index) => {
                if (index > 0) {
                    const divider = document.createElement('div');
                    _.addCssClass(divider, 'ag-multi-filter-divider');
                    this.getGui().appendChild(divider);
                }

                this.filters.push(filter);
                this.getGui().appendChild(filter.getGui());
            });
        });
    }

    public isFilterActive(): boolean {
        return _.some(this.filters, filter => filter.isFilterActive());
    }

    public doesFilterPass(params: IDoesFilterPassParams, filterToSkip?: IFilterComp): boolean {
        let rowPasses = true;

        this.activeFilters.forEach(activeFilter => {
            if (!rowPasses || activeFilter === filterToSkip) { return; }

            rowPasses = activeFilter.doesFilterPass(params);
        });

        return rowPasses;
    }

    private getFilterType(): string {
        return 'multi';
    }

    public getModelFromUi(): MultiFilterModel {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: MultiFilterModel = {
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

        const model: MultiFilterModel = {
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

    public setModel(model: MultiFilterModel): Promise<void> {
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

    public getFilter(index: number): Promise<IFilterComp> {
        return Promise.resolve(this.filters[index]);
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        this.executeFunctionIfExists('afterGuiAttached', params);
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
        this.activeFilters.clear();

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
            doesRowPassOtherFilter,
            doesRowPassSiblingFilters: node => this.doesFilterPass({ node, data: node.data }, filterInstance),
        };

        const filterPromise = this.userComponentFactory.newFilterComponent(filterDef, filterParams, 'agTextColumnFilter');

        if (filterPromise != null) {
            return filterPromise.then(filter => filterInstance = filter);
        }

        return filterPromise;
    }

    private filterChanged(index: number): void {
        const changedFilter = this.filters[index];

        if (changedFilter.isFilterActive()) {
            this.activeFilters.add(changedFilter);
        } else {
            this.activeFilters.delete(changedFilter);
        }

        const isAnySiblingFilterActive = this.activeFilters.size > 0;

        _.forEach(this.filters, filter => {
            if (filter === changedFilter) { return; }

            if (!this.combineFilters && filter.isFilterActive()) {
                filter.setModel(null);
            }

            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }

            if (typeof filter.onSiblingFilterChanged === 'function') {
                filter.onSiblingFilterChanged(isAnySiblingFilterActive);
            }
        });

        this.filterChangedCallback();
    }
}
