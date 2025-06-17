import type { AgColumn } from '../../../entities/agColumn';
import type { FilterChangedEvent } from '../../../events';
import { Component } from '../../../widgets/component';
import type { IProvidedFilterParams, ProvidedFilterModel } from '../../provided/iProvidedFilter';
import type {
    ICombinedSimpleModel,
    ISimpleFilter,
    ISimpleFilterModel,
    ISimpleFilterModelType,
    ISimpleFilterParams,
} from '../../provided/iSimpleFilter';
import { OptionsFactory } from '../../provided/optionsFactory';
import type { SimpleFilterModelFormatter } from '../../provided/simpleFilterModelFormatter';
import type { FloatingFilterDisplayParams, IFloatingFilterComp, IFloatingFilterParams } from '../floatingFilter';

export abstract class SimpleFloatingFilter<TParams extends IFloatingFilterParams<ISimpleFilter>>
    extends Component
    implements IFloatingFilterComp<ISimpleFilter>
{
    protected abstract onModelUpdated(model: ProvidedFilterModel): void;

    protected abstract readonly defaultOptions: string[];
    protected abstract setEditable(editable: boolean): void;

    protected filterModelFormatter: SimpleFilterModelFormatter<ISimpleFilterParams>;

    protected params: TParams;

    protected lastType: string | null | undefined;
    protected optionsFactory: OptionsFactory;
    protected readOnly: boolean;
    protected defaultDebounceMs: number = 0;

    protected reactive: boolean;

    protected abstract readonly filterType: 'text' | 'number' | 'date';

    protected abstract readonly FilterModelFormatterClass: new (
        optionsFactory: OptionsFactory,
        filterParams: ISimpleFilterParams
    ) => SimpleFilterModelFormatter<ISimpleFilterParams>;

    protected setLastTypeFromModel(model: ProvidedFilterModel): void {
        // if no model provided by the parent filter use default
        if (!model) {
            this.lastType = this.optionsFactory.defaultOption;
            return;
        }

        const isCombined = (model as any).operator;

        let condition: ISimpleFilterModel;

        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<ISimpleFilterModel>;
            condition = combinedModel.conditions![0];
        } else {
            condition = model as ISimpleFilterModel;
        }

        this.lastType = condition.type;
    }

    protected canWeEditAfterModelFromParentFilter(model: ProvidedFilterModel): boolean {
        if (!model) {
            // if no model, then we can edit as long as the lastType is something we can edit, as this
            // is the type we will provide to the parent filter if the user decides to use the floating filter.
            return this.isTypeEditable(this.lastType);
        }

        // never allow editing if the filter is combined (ie has two parts)
        const isCombined = (model as any).operator;

        if (isCombined) {
            return false;
        }

        const simpleModel = model as ISimpleFilterModel;

        return this.isTypeEditable(simpleModel.type);
    }

    public init(params: TParams): void {
        this.params = params;
        const reactive = this.gos.get('enableFilterHandlers');
        this.reactive = reactive;
        this.setParams(params);

        if (reactive) {
            const reactiveParams = params as unknown as FloatingFilterDisplayParams;
            this.onModelUpdated(reactiveParams.model);
        }
    }

    protected setParams(params: TParams): void {
        const optionsFactory = new OptionsFactory();
        this.optionsFactory = optionsFactory;
        optionsFactory.init(params.filterParams as ISimpleFilterParams, this.defaultOptions);

        this.filterModelFormatter = this.createManagedBean(
            new this.FilterModelFormatterClass(optionsFactory, params.filterParams as ISimpleFilterParams)
        );

        this.setSimpleParams(params, false);
    }

    private setSimpleParams(params: TParams, update: boolean = true): void {
        const defaultOption = this.optionsFactory.defaultOption;
        // Initial call
        if (!update) {
            this.lastType = defaultOption;
        }

        // readOnly is a property of IProvidedFilterParams - we need to find a better (type-safe)
        // way to support reading this in the future.
        this.readOnly = !!(params.filterParams as IProvidedFilterParams).readOnly;

        // we are editable if:
        // 1) there is a type (user has configured filter wrong if not type)
        //  AND
        // 2) the default type is not 'inRange'
        const editable = this.isTypeEditable(defaultOption);
        this.setEditable(editable);
    }

    public refresh(params: TParams): void {
        this.params = params;
        const reactiveParams = params as unknown as FloatingFilterDisplayParams;
        const reactive = this.reactive;
        if (!reactive || reactiveParams.source === 'colDef') {
            this.updateParams(params);
        }

        if (reactive) {
            const { source, model } = reactiveParams;
            if (source === 'dataChanged' || source === 'ui') {
                return;
            }
            this.onModelUpdated(model);
        }
    }

    protected updateParams(params: TParams): void {
        const optionsFactory = this.optionsFactory;
        optionsFactory.refresh(params.filterParams as ISimpleFilterParams, this.defaultOptions);

        this.setSimpleParams(params);

        this.filterModelFormatter.updateParams({
            optionsFactory,
            filterParams: params.filterParams as ISimpleFilterParams,
        });
    }

    public onParentModelChanged(model: ProvidedFilterModel, event: FilterChangedEvent): void {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing.
        // This is similar for data changes, which don't affect simple floating filters
        if (event?.afterFloatingFilter || event?.afterDataChange) {
            return;
        }

        this.onModelUpdated(model);
    }

    private hasSingleInput(filterType: string) {
        const numberOfInputs = this.optionsFactory.getCustomOption(filterType)?.numberOfInputs;
        return numberOfInputs == null || numberOfInputs == 1;
    }

    private isTypeEditable(type?: string | null): boolean {
        const uneditableTypes: ISimpleFilterModelType[] = ['inRange', 'empty', 'blank', 'notBlank'];
        return (
            !!type &&
            !this.readOnly &&
            this.hasSingleInput(type) &&
            uneditableTypes.indexOf(type as ISimpleFilterModelType) < 0
        );
    }

    protected getAriaLabel(params: IFloatingFilterParams): string {
        const displayName = this.beans.colNames.getDisplayNameForColumn(params.column as AgColumn, 'header', true);
        return `${displayName} ${this.getLocaleTextFunc()('ariaFilterInput', 'Filter Input')}`;
    }
}
