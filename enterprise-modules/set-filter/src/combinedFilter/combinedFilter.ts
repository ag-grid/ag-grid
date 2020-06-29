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
    ISetFilterParams,
    Component,
    IFilterParams,
} from '@ag-grid-community/core';

export interface CombinedFilterParams extends ISetFilterParams {
    filters?: IFilterDef[];
    allowAllFiltersConcurrently?: boolean;
}

export interface CombinedFilterModel {
    filterType: string;
    filterModels: any[];
}

export class CombinedFilter extends Component implements IFilterComp {
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private params: CombinedFilterParams;
    private filters: IFilterComp[] = [];
    private activeFilters = new Set<IFilterComp>();
    private column: Column;
    private filterChangedCallback: () => void;
    private allowAllFiltersConcurrently: boolean;

    constructor() {
        super('<div class="combined-filter"></div>');
    }

    public static getFilterDefs(params: CombinedFilterParams): IFilterDef[] {
        const { filters } = params;

        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    }

    public init(params: CombinedFilterParams): void {
        this.params = params;

        const { column, filterChangedCallback, allowAllFiltersConcurrently } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;
        this.allowAllFiltersConcurrently = !!allowAllFiltersConcurrently;

        const filters = CombinedFilter.getFilterDefs(params);

        _.forEach(filters, (filterDef, index) => {
            if (index > 0) {
                const divider = document.createElement('div');
                _.addCssClass(divider, 'ag-combined-filter-divider');
                this.getGui().appendChild(divider);
            }

            const filter = this.createFilter(filterDef, index).resolveNow(null, f => f);

            this.filters.push(filter);
            this.getGui().appendChild(filter.getGui());
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
        return 'combined';
    }

    public getModelFromUi(): CombinedFilterModel {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: CombinedFilterModel = {
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

        const model: CombinedFilterModel = {
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

    public setModel(model: CombinedFilterModel): Promise<void> {
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
        super.destroy();
    }

    private executeFunctionIfExists<T extends IFilterComp>(name: keyof T, ...params: any[]) {
        _.forEach(this.filters, filter => {
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

        return this.userComponentFactory
            .newFilterComponent(filterDef, filterParams, 'agTextColumnFilter').then(filter => filterInstance = filter);
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

            if (!this.allowAllFiltersConcurrently && filter.isFilterActive()) {
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
