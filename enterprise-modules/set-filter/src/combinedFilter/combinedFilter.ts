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
    combineWith: IFilterDef;
}

export interface CombinedFilterModel extends ProvidedFilterModel {
    combinedFilterModel: any;
    setFilterModel: SetFilterModel;
}

export class CombinedFilter extends ProvidedFilter {
    @RefSelector('eCombinedFilter') private readonly eCombinedFilter: HTMLElement;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private column: Column;
    private combineWithFilter: IFilterComp;
    private setFilter: SetFilter;
    private filterChangedCallback: () => void;
    private clientSideValuesExtractor: ClientSideValuesExtractor;

    public init(params: CombinedFilterParams): void {
        const { column, filterChangedCallback, filterModifiedCallback, doesRowPassOtherFilter } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;

        this.combineWithFilter = this.createProvidedFilter(params);
        this.eCombinedFilter.appendChild(this.combineWithFilter.getGui());

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
        if (typeof this.combineWithFilter.afterGuiAttached === 'function') {
            this.combineWithFilter.afterGuiAttached(params);
        }

        this.setFilter.afterGuiAttached(params);
    }

    public isFilterActive(): boolean {
        return this.combineWithFilter.isFilterActive() || this.setFilter.isFilterActive();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return (!this.combineWithFilter.isFilterActive() || this.combineWithFilter.doesFilterPass(params)) &&
            (!this.setFilter.isFilterActive() || this.setFilter.doesFilterPass(params));
    }

    protected getFilterType(): string {
        return 'combined';
    }

    public getModelFromUi(): CombinedFilterModel {
        const model: CombinedFilterModel = {
            filterType: this.getFilterType(),
            combinedFilterModel: null,
            setFilterModel: null,
        };

        if (this.combineWithFilter.isFilterActive()) {
            const providedFilter = this.combineWithFilter as ProvidedFilter;

            if (typeof providedFilter.getModelFromUi === 'function') {
                model.combinedFilterModel = providedFilter.getModelFromUi();
            }
        }

        if (this.setFilter.isFilterActive()) {
            model.setFilterModel = this.setFilter.getModelFromUi();
        }

        return model;
    }

    public getModel(): ProvidedFilterModel {
        if (!this.combineWithFilter.isFilterActive() && !this.setFilter.isFilterActive()) {
            return null;
        }

        const model: CombinedFilterModel = {
            filterType: this.getFilterType(),
            combinedFilterModel: null,
            setFilterModel: null,
        };

        if (this.combineWithFilter.isFilterActive()) {
            model.combinedFilterModel = this.combineWithFilter.getModel();
        }

        if (this.setFilter.isFilterActive()) {
            model.setFilterModel = this.setFilter.getModel();
        }

        return model;
    }

    public setModel(model: CombinedFilterModel): Promise<void> {
        const setCombineFilterModel = (model: any) => {
            return new Promise<void>(resolve => {
                const promise = this.combineWithFilter.setModel(model);

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
                setCombineFilterModel(model.combinedFilterModel)
                    .then(() => this.setFilter.setModel(model.setFilterModel).then(() => resolve()));
            }
        });
    }

    public getCombineWithFilter(): IFilterComp {
        return this.combineWithFilter;
    }

    public getSetFilter(): SetFilter {
        return this.setFilter;
    }

    public getValueModel(): SetValueModel {
        return this.setFilter.getValueModel();
    }

    public onAnyFilterChanged(): void {
        if (typeof this.combineWithFilter.onAnyFilterChanged === 'function') {
            this.combineWithFilter.onAnyFilterChanged();
        }

        this.setFilter.onAnyFilterChanged();
    }

    public onNewRowsLoaded(): void {
        if (typeof this.combineWithFilter.onNewRowsLoaded === 'function') {
            this.combineWithFilter.onNewRowsLoaded();
        }

        this.setFilter.onNewRowsLoaded();
    }

    public onFloatingFilterChanged(type: string, value: any): void {
        const filter = this.combineWithFilter as SimpleFilter<any>;

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


    private createProvidedFilter(params: CombinedFilterParams): IFilterComp {
        const { combineWith, filterModifiedCallback, doesRowPassOtherFilter } = params;
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

            if (this.combineWithFilter.isFilterActive() && this.clientSideValuesExtractor) {
                const predicate = (node: RowNode) => this.combineWithFilter.doesFilterPass({ node, data: node.data });
                const values = this.clientSideValuesExtractor.extractUniqueValues(predicate);
                this.setFilter.setModelIntoUi({ filterType: 'set', values });
            } else {
                this.setFilter.setModelIntoUi(null);
            }
        }

        if (filterType === 'set') {
            if (this.combineWithFilter.isFilterActive()) {
                this.combineWithFilter.setModel(null);
            }

            this.filterChangedCallback();
        }
    }
}