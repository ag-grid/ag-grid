import { BeanStub } from '../../context/beanStub';
import type {
    DoesFilterPassParams,
    FilterHandler,
    FilterHandlerParams,
    IDoesFilterPassParams,
} from '../../interfaces/iFilter';
import type {
    FilterOptionKey,
    ICombinedSimpleModel,
    ISimpleFilterModel,
    ISimpleFilterParams,
    MapValuesFromSimpleFilterModel,
    Tuple,
} from './iSimpleFilter';
import { isCombinedFilterModel } from './iSimpleFilter';
import { OptionsFactory } from './optionsFactory';
import type { SimpleFilterModelFormatter } from './simpleFilterModelFormatter';
import type { FilterOptionSet } from './simpleFilterUtils';

export abstract class SimpleFilterHandler<
    TModel extends ISimpleFilterModel,
    TValue,
    TParams extends ISimpleFilterParams,
>
    extends BeanStub
    implements FilterHandler<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>
{
    /** Used to get the filter type for filter models. */
    public abstract readonly filterType: 'text' | 'number' | 'bigint' | 'date';

    protected abstract readonly FilterModelFormatterClass: new (
        optionsFactory: OptionsFactory,
        filterParams: ISimpleFilterParams
    ) => SimpleFilterModelFormatter<ISimpleFilterParams>;

    protected params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>;
    private optionsFactory: OptionsFactory;
    private filterModelFormatter: SimpleFilterModelFormatter<ISimpleFilterParams>;

    constructor(
        private readonly mapValuesFromModel: MapValuesFromSimpleFilterModel<TModel, TValue>,
        private readonly options: FilterOptionSet
    ) {
        super();
    }

    protected abstract evaluateNullValue(filterType?: FilterOptionKey | null): boolean;

    protected abstract evaluateNonNullValue(
        range: Tuple<TValue>,
        cellValue: TValue,
        filterModel: TModel,
        params: IDoesFilterPassParams
    ): boolean;

    public init(params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>): void {
        const filterParams = params.filterParams;
        const optionsFactory = new OptionsFactory();
        this.optionsFactory = optionsFactory;
        optionsFactory.init(this.beans.log, filterParams, this.options);

        this.filterModelFormatter = this.createManagedBean(
            new this.FilterModelFormatterClass(optionsFactory, filterParams)
        );

        this.updateParams(params);

        this.validateModel(params);
    }

    public refresh(params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>): void {
        if (params.source === 'colDef') {
            const filterParams = params.filterParams;
            const optionsFactory = this.optionsFactory;
            optionsFactory.refresh(this.beans.log, filterParams, this.options);
            this.filterModelFormatter.updateParams({ optionsFactory, filterParams });

            this.updateParams(params);
        }

        this.validateModel(params);
    }

    protected updateParams(
        params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>
    ): void {
        this.params = params;
    }

    public doesFilterPass(params: DoesFilterPassParams<any, TModel | ICombinedSimpleModel<TModel>>): boolean {
        const model = params.model;

        if (model == null) {
            return true;
        }

        const { operator } = model as ICombinedSimpleModel<TModel>;
        const models: TModel[] = [];

        if (operator) {
            const combinedModel = model as ICombinedSimpleModel<TModel>;

            models.push(...(combinedModel.conditions ?? []));
        } else {
            models.push(model as TModel);
        }

        const isOr = operator === 'OR';
        const cellValue = this.params.getValue(params.node);

        // A condition filtering on nothing neither adds rows to an OR nor removes them from an AND.
        let anyFiltering = false;
        for (let i = 0, len = models.length; i < len; ++i) {
            const passes = this.individualConditionPasses(params, models[i], cellValue);
            if (passes === isOr) {
                return passes;
            }
            anyFiltering ||= passes !== undefined;
        }
        // An AND that got here passed every condition; an OR passed none, so it passes only if none filtered.
        return !isOr || !anyFiltering;
    }

    public getModelAsString(
        model: TModel | ICombinedSimpleModel<TModel> | null,
        source?: 'floating' | 'filterToolPanel'
    ): string {
        return this.filterModelFormatter.getModelAsString(model, source) ?? '';
    }

    protected validateModel(
        params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>
    ): void {
        const model = params.model;
        const maxNumConditions = params.filterParams.maxNumConditions;

        if (model == null) {
            return;
        }

        const isCombined = isCombinedFilterModel(model);

        // A hand-written combined model can omit `conditions` entirely.
        let conditions: TModel[] = (isCombined ? model.conditions : [model]) ?? [];

        // Checked against the list the dropdown is built from, so a malformed option does not count as offered.
        const optionsFactory = this.optionsFactory;
        if (!conditions.every((condition) => optionsFactory.hasOption(condition.type))) {
            this.params = {
                ...params,
                model: null,
            };
            params.onModelChange(null);
            return;
        }

        let needsUpdate = false;

        const filterType = this.filterType;

        if (!conditions.every((condition) => condition.filterType === filterType) || model.filterType !== filterType) {
            // need to add filterType to model
            conditions = conditions.map((condition) => ({ ...condition, filterType }));
            needsUpdate = true;
        }

        // Check number of conditions vs maxNumConditions
        if (typeof maxNumConditions === 'number' && conditions.length > maxNumConditions) {
            conditions = conditions.slice(0, maxNumConditions);
            needsUpdate = true;
        }

        if (needsUpdate) {
            const updatedModel =
                conditions.length === 1
                    ? {
                          ...conditions[0],
                          filterType,
                      }
                    : {
                          ...(model as ICombinedSimpleModel<TModel>),
                          filterType,
                          conditions,
                      };
            this.params = {
                ...params,
                model: updatedModel,
            };
            params.onModelChange(updatedModel);
        }
    }

    /** Whether the row passes the condition, or `undefined` where the condition filters on nothing. */
    private individualConditionPasses(
        params: IDoesFilterPassParams,
        filterModel: TModel,
        cellValue: any
    ): boolean | undefined {
        const optionsFactory = this.optionsFactory;
        const values = this.mapValuesFromModel(filterModel, optionsFactory);
        const customFilterOption = optionsFactory.getCustomOption(filterModel.type);

        if (customFilterOption) {
            // `predicate` is the whole of what a custom option filters on, so short of a value it filters nothing.
            for (let i = 0, len = values.length; i < len; ++i) {
                if (values[i] == null) {
                    return undefined;
                }
            }
            // A predicate may return any truthy value; `undefined` is reserved for "filters on nothing".
            return !!customFilterOption.predicate(values, cellValue);
        }

        if (cellValue == null) {
            return this.evaluateNullValue(filterModel.type);
        }

        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    }
}
