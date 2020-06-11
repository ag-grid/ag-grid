import { ProvidedFilter, Promise, ProvidedFilterModel, IDoesFilterPassParams, PostConstruct, RefSelector, IFilterParams, TextFilter, IAfterGuiAttachedParams, ISimpleFilterParams, ColDef, IClientSideRowModel, _, RowNode, Constants } from '@ag-grid-community/core';
import { SetFilter } from '../setFilter/setFilter';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';

export class CombinedFilter extends ProvidedFilter {
    @RefSelector('eCombinedFilter') private readonly eCombinedFilter: HTMLElement;

    private providedFilter: ProvidedFilter;
    private setFilter: SetFilter;
    private filterChangedCallback: () => void;
    private uniqueValuesExtractor: ClientSideValuesExtractor;

    @PostConstruct
    protected postConstruct(): void {
        super.postConstruct();

        this.providedFilter = this.createManagedBean(new TextFilter());
        this.eCombinedFilter.appendChild(this.providedFilter.getGui());

        const divider = document.createElement('div');
        divider.style.borderBottom = 'solid 1px var(--ag-secondary-border-color, #dde2eb)';
        this.eCombinedFilter.appendChild(divider);

        this.setFilter = this.createManagedBean(new SetFilter());
        this.eCombinedFilter.appendChild(this.setFilter.getGui());
    }

    public init(params: IFilterParams): void {
        if (params.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.uniqueValuesExtractor = new ClientSideValuesExtractor(
                params.rowModel as IClientSideRowModel,
                params.colDef,
                params.valueGetter
            );
        }

        this.filterChangedCallback = params.filterChangedCallback;

        this.providedFilter.init({
            ...params,
            alwaysShowBothConditions: true,
            filterChangedCallback: () => this.filterChanged('provided')
        } as ISimpleFilterParams);

        this.setFilter.init({
            ...params,
            filterChangedCallback: () => this.filterChanged('set')
        });
    }

    public afterGuiAttached(params: IAfterGuiAttachedParams): void {
        this.providedFilter.afterGuiAttached(params);
        this.setFilter.afterGuiAttached(params);
    }

    public isFilterActive(): boolean {
        return this.providedFilter.isFilterActive() || this.setFilter.isFilterActive();
    }

    doesFilterPass(params: IDoesFilterPassParams): boolean {
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
        return this.setFilter.getModel();
    }

    private filterChanged(filterType: 'provided' | 'set'): void {
        if (filterType === 'provided') {
            if (this.setFilter.isFilterActive()) {
                this.setFilter.setModel(null);
            }

            this.filterChangedCallback();

            if (this.providedFilter.isFilterActive() && this.uniqueValuesExtractor) {
                const predicate = (node: RowNode) => this.providedFilter.doesFilterPass({ node, data: node.data });
                const values = this.uniqueValuesExtractor.extractUniqueValues(predicate);
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

    public onAnyFilterChanged(): void {
        this.setFilter.onAnyFilterChanged();
    }
}