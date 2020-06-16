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
} from '@ag-grid-community/core';
import { SetFilter } from '../setFilter/setFilter';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { SetValueModel } from '../setFilter/setValueModel';

export interface CombinedFilterParams extends IProvidedFilterParams {
    combineWith: IFilterDef;
}

export class CombinedFilter extends ProvidedFilter {
    @RefSelector('eCombinedFilter') private readonly eCombinedFilter: HTMLElement;
    @Autowired('filterManager') private readonly filterManager: FilterManager;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private column: Column;
    private providedFilter: IFilterComp;
    private setFilter: SetFilter;
    private filterChangedCallback: () => void;
    private clientSideValuesExtractor: ClientSideValuesExtractor;

    public init(params: CombinedFilterParams): void {
        const { column, combineWith, filterChangedCallback, filterModifiedCallback, doesRowPassOtherFilter } = params;

        this.column = column;
        this.filterChangedCallback = filterChangedCallback;

        this.providedFilter = this.createProvidedFilter(params);
        this.eCombinedFilter.appendChild(this.providedFilter.getGui());

        const divider = document.createElement('div');
        divider.style.borderBottom = 'solid 1px var(--ag-secondary-border-color, #dde2eb)';
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
        if (typeof this.providedFilter.afterGuiAttached === 'function') {
            this.providedFilter.afterGuiAttached(params);
        }

        this.setFilter.afterGuiAttached(params);
    }

    public isFilterActive(): boolean {
        return this.providedFilter.isFilterActive() || this.setFilter.isFilterActive();
    }

    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return (!this.providedFilter.isFilterActive() || this.providedFilter.doesFilterPass(params)) &&
            (!this.setFilter.isFilterActive() || this.setFilter.doesFilterPass(params));
    }

    protected updateUiVisibility(): void {
    }

    protected createBodyTemplate(): string {
        return `<div ref="eCombinedFilter"></div>`;
    }

    protected getCssIdentifier(): string {
        return 'combined-filter';
    }

    protected resetUiToDefaults(silent?: boolean): Promise<void> {
        return Promise.resolve();
    }

    protected setModelIntoUi(model: ProvidedFilterModel): Promise<void> {
        return Promise.resolve();
    }

    protected areModelsEqual(a: ProvidedFilterModel, b: ProvidedFilterModel): boolean {
        return false;
    }

    getModelFromUi(): ProvidedFilterModel {
        return null;
    }

    public getModel(): ProvidedFilterModel {
        if (this.providedFilter.isFilterActive()) {
            return this.providedFilter.getModel();
        }

        if (this.setFilter.isFilterActive()) {
            return this.setFilter.getModel();
        }

        return null;
    }

    public getValueModel(): SetValueModel {
        return this.setFilter.getValueModel();
    }

    public onAnyFilterChanged(): void {
        if (typeof this.providedFilter.onAnyFilterChanged === 'function') {
            this.providedFilter.onAnyFilterChanged();
        }

        this.setFilter.onAnyFilterChanged();
    }

    public onNewRowsLoaded(): void {
        if (typeof this.providedFilter.onNewRowsLoaded === 'function') {
            this.providedFilter.onNewRowsLoaded();
        }

        this.setFilter.onNewRowsLoaded();
    }

    public onFloatingFilterChanged(type: string, value: any): void {
        const filter = this.providedFilter as SimpleFilter<any>;

        if (typeof filter.onFloatingFilterChanged === 'function') {
            filter.onFloatingFilterChanged(type, value);
        }
    }

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

            if (this.providedFilter.isFilterActive() && this.clientSideValuesExtractor) {
                const predicate = (node: RowNode) => this.providedFilter.doesFilterPass({ node, data: node.data });
                const values = this.clientSideValuesExtractor.extractUniqueValues(predicate);
                this.setFilter.setModelIntoUi({ filterType: 'set', values });
            } else {
                this.setFilter.setModelIntoUi(null);
            }
        }

        if (filterType === 'set') {
            if (this.providedFilter.isFilterActive()) {
                this.providedFilter.setModel(null);
            }

            this.filterChangedCallback();
        }
    }
}