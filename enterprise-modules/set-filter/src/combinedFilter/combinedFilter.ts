import {
    ProvidedFilter,
    Promise,
    ProvidedFilterModel,
    IDoesFilterPassParams,
    RefSelector,
    IAfterGuiAttachedParams,
    IClientSideRowModel,
    _,
    RowNode,
    Constants,
    IProvidedFilterParams,
    IFilterComp,
    Autowired,
    UserComponentFactory,
} from '@ag-grid-community/core';
import { SetFilter } from '../setFilter/setFilter';
import { ClientSideValuesExtractor } from '../clientSideValueExtractor';
import { SetValueModel } from '../setFilter/setValueModel';

export interface CombinedFilterParams extends IProvidedFilterParams {
    combineWithFilter: string;
}

export class CombinedFilter extends ProvidedFilter {
    @RefSelector('eCombinedFilter') private readonly eCombinedFilter: HTMLElement;
    @Autowired('userComponentFactory') private readonly userComponentFactory: UserComponentFactory;

    private providedFilter: IFilterComp;
    private setFilter: SetFilter;
    private filterChangedCallback: () => void;
    private clientSideValuesExtractor: ClientSideValuesExtractor;

    public init(params: CombinedFilterParams): void {
        this.filterChangedCallback = params.filterChangedCallback;

        this.providedFilter = this.userComponentFactory.createAndInitUserComponent(
            { filter: params.combineWithFilter || 'agTextColumnFilter' },
            {
                ...params,
                alwaysShowBothConditions: true,
                filterChangedCallback: () => this.filterChanged('provided')
            },
            { propertyName: 'filter', isCellRenderer: () => false }).resolveNow(null, c => c) as IFilterComp;

        this.eCombinedFilter.appendChild(this.providedFilter.getGui());

        const divider = document.createElement('div');
        divider.style.borderBottom = 'solid 1px var(--ag-secondary-border-color, #dde2eb)';
        this.eCombinedFilter.appendChild(divider);

        this.setFilter = this.userComponentFactory.createUserComponentFromConcreteClass(
            SetFilter,
            {
                ...params,
                filterChangedCallback: () => this.filterChanged('set')
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
        if (this.providedFilter.isFilterActive()) {
            return this.providedFilter.getModel();
        }

        if (this.setFilter.isFilterActive()) {
            return this.setFilter.getModel();
        }

        return null;
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

    public onAnyFilterChanged(): void {
        this.setFilter.onAnyFilterChanged();
    }

    public getValueModel(): SetValueModel {
        return this.setFilter.getValueModel();
    }

    public onFloatingFilterChanged(type: string, value: any): void {
        if ((this.providedFilter as any).onFloatingFilterChanged) {
            (this.providedFilter as any).onFloatingFilterChanged(type, value);
        }
    }
}