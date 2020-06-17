import {
    ProvidedFilter,
    Promise,
    ProvidedFilterModel,
    IDoesFilterPassParams,
    RefSelector,
    IAfterGuiAttachedParams,
    IClientSideRowModel,
    RowNode,
    Constants,
    IProvidedFilterParams,
    IFilterComp,
    Autowired,
    UserComponentFactory,
    FilterManager,
    Column,
    IFilterDef,
    SimpleFilter,
    _,
} from '@ag-grid-community/core';
import { SetFilter } from '../setFilter/setFilter';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { SetValueModel } from '../setFilter/setValueModel';
import { SetFilterModel } from '../setFilter/setFilterModel';

export interface CombinedFilterParams extends IProvidedFilterParams {
    wrappedFilter: IFilterDef;
}

export interface CombinedFilterModel extends ProvidedFilterModel {
    wrappedFilterModel: any;
    setFilterModel: SetFilterModel;
}

export class CombinedFilter extends ProvidedFilter {
    @RefSelector('eCombinedFilter') private readonly eCombinedFilter: HTMLElement;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private column: Column;
    private wrappedFilter: IFilterComp;
    private setFilter: SetFilter;
    private filterChangedCallback: () => void;
    private clientSideValuesExtractor: ClientSideValuesExtractor;

    public init(params: CombinedFilterParams): void {
        const { column, filterChangedCallback, filterModifiedCallback, doesRowPassOtherFilter } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;

        this.wrappedFilter = this.createWrappedFilter(params);
        this.eCombinedFilter.appendChild(this.wrappedFilter.getGui());

        const divider = document.createElement('div');
        _.addCssClass(divider, 'ag-combined-filter-divider');
        this.eCombinedFilter.appendChild(divider);

        this.setFilter = this.userComponentFactory.createUserComponentFromConcreteClass(
            SetFilter,
            {
                ...params,
                filterModifiedCallback,
                filterChangedCallback: () => this.filterChanged('set'),
                doesRowPassOtherFilter,
            });

        this.eCombinedFilter.appendChild(this.setFilter.getGui());

        if (params.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideValuesExtractor = new ClientSideValuesExtractor(
                params.rowModel as IClientSideRowModel,
                params.colDef,
                params.valueGetter
            );
        }
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        if (typeof this.wrappedFilter.afterGuiAttached === 'function') {
            this.wrappedFilter.afterGuiAttached(params);
        }

        this.setFilter.afterGuiAttached(params);
    }

    public isFilterActive(): boolean {
        return this.wrappedFilter.isFilterActive() || this.setFilter.isFilterActive();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return (!this.wrappedFilter.isFilterActive() || this.wrappedFilter.doesFilterPass(params)) &&
            (!this.setFilter.isFilterActive() || this.setFilter.doesFilterPass(params));
    }

    protected getFilterType(): string {
        return 'combined';
    }

    public getModelFromUi(): CombinedFilterModel {
        const model: CombinedFilterModel = {
            filterType: this.getFilterType(),
            wrappedFilterModel: null,
            setFilterModel: null,
        };

        if (this.wrappedFilter.isFilterActive()) {
            const providedFilter = this.wrappedFilter as ProvidedFilter;

            if (typeof providedFilter.getModelFromUi === 'function') {
                model.wrappedFilterModel = providedFilter.getModelFromUi();
            }
        }

        if (this.setFilter.isFilterActive()) {
            model.setFilterModel = this.setFilter.getModelFromUi();
        }

        return model;
    }

    public getModel(): ProvidedFilterModel {
        if (!this.wrappedFilter.isFilterActive() && !this.setFilter.isFilterActive()) {
            return null;
        }

        const model: CombinedFilterModel = {
            filterType: this.getFilterType(),
            wrappedFilterModel: null,
            setFilterModel: null,
        };

        if (this.wrappedFilter.isFilterActive()) {
            model.wrappedFilterModel = this.wrappedFilter.getModel();
        }

        if (this.setFilter.isFilterActive()) {
            model.setFilterModel = this.setFilter.getModel();
        }

        return model;
    }

    public setModel(model: CombinedFilterModel): Promise<void> {
        const setCombineFilterModel = (model: any) => {
            return new Promise<void>(resolve => {
                const promise = this.wrappedFilter.setModel(model);

                if (promise == null) {
                    resolve();
                } else {
                    (promise as Promise<void>).then(() => resolve());
                }
            });
        };

        return new Promise(resolve => {
            if (model == null) {
                setCombineFilterModel(null).then(() => this.setFilter.setModel(null).then(() => resolve()));
            } else {
                setCombineFilterModel(model.wrappedFilterModel)
                    .then(() => this.setFilter.setModel(model.setFilterModel).then(() => resolve()));
            }
        });
    }

    public getWrappedFilter(): IFilterComp {
        return this.wrappedFilter;
    }

    public getSetFilter(): SetFilter {
        return this.setFilter;
    }

    public getValueModel(): SetValueModel {
        return this.setFilter.getValueModel();
    }

    public onAnyFilterChanged(): void {
        if (typeof this.wrappedFilter.onAnyFilterChanged === 'function') {
            this.wrappedFilter.onAnyFilterChanged();
        }

        this.setFilter.onAnyFilterChanged();
    }

    public onNewRowsLoaded(): void {
        if (typeof this.wrappedFilter.onNewRowsLoaded === 'function') {
            this.wrappedFilter.onNewRowsLoaded();
        }

        this.setFilter.onNewRowsLoaded();
    }

    public onFloatingFilterChanged(type: string, value: any): void {
        const filter = this.wrappedFilter as SimpleFilter<any>;

        if (typeof filter.onFloatingFilterChanged === 'function') {
            filter.onFloatingFilterChanged(type, value);
        }

        // floating set filter is read-only, so will never trigger a change
    }

    protected updateUiVisibility(): void {
    }

    protected createBodyTemplate(): string {
        return `<div ref="eCombinedFilter"></div>`;
    }

    protected getCssIdentifier(): string {
        return 'combined-filter';
    }

    // -----------------------------------------------------------------------------------------------------------------
    // These methods have "dummy" implementations because they are not really used - the wrapped filters have the
    // relevant implementations.
    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected setModelIntoUi(model: ProvidedFilterModel): Promise<void> {
        return Promise.resolve();
    }

    protected areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean {
        return false;
    }
    // -----------------------------------------------------------------------------------------------------------------


    private createWrappedFilter(params: CombinedFilterParams): IFilterComp {
        const { wrappedFilter: combineWith, filterModifiedCallback, doesRowPassOtherFilter } = params;
        const filterDef = combineWith || {};
        const filterParams =
        {
            ...this.filterManager.createFilterParams(this.column, this.column.getColDef()),
            alwaysShowBothConditions: true, // default to always show both conditions for combined filter,
            filterModifiedCallback,
            filterChangedCallback: () => this.filterChanged('provided'),
            doesRowPassOtherFilter
        };

        return this.userComponentFactory
            .newFilterComponent(filterDef, filterParams, 'agTextColumnFilter')
            .resolveNow(null, c => c);
    }

    private filterChanged(filterType: 'provided' | 'set'): void {
        if (filterType === 'provided') {
            if (this.setFilter.isFilterActive()) {
                this.setFilter.setModel(null);
            }

            this.filterChangedCallback();

            if (this.wrappedFilter.isFilterActive() && this.clientSideValuesExtractor) {
                const predicate = (node: RowNode) => this.wrappedFilter.doesFilterPass({ node, data: node.data });
                const values = this.clientSideValuesExtractor.extractUniqueValues(predicate);
                this.setFilter.setModelIntoUi({ filterType: 'set', values });
            } else {
                this.setFilter.setModelIntoUi(null);
            }
        }

        if (filterType === 'set') {
            if (this.wrappedFilter.isFilterActive()) {
                this.wrappedFilter.setModel(null);
            }

            this.filterChangedCallback();
        }
    }
}