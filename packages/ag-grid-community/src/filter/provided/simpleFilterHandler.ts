import { BeanStub } from '../../context/beanStub';
import type { Column } from '../../interfaces/iColumn';
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
import { evaluateCustomFilter, getConditionLimit, getNumberOfInputs } from './simpleFilterUtils';

/** A condition saved by another filter type, whose values may be of any type. */
type ForeignSimpleFilterModel = ISimpleFilterModel & { filter?: unknown; filterTo?: unknown };

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

    /** Subclasses narrow `filterParams` to their own filter's params type. */
    protected abstract createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: ISimpleFilterParams,
        column: Column
    ): SimpleFilterModelFormatter<ISimpleFilterParams>;

    protected params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>;
    private optionsFactory: OptionsFactory;
    private filterModelFormatter: SimpleFilterModelFormatter<ISimpleFilterParams>;
    private readonly warnedKeys = new Set<FilterOptionKey | null | undefined>();

    constructor(
        private readonly mapValuesFromModel: MapValuesFromSimpleFilterModel<TModel, TValue>,
        private readonly defaultOptions: string[]
    ) {
        super();
    }

    protected abstract evaluateNullValue(filterType?: FilterOptionKey | null): boolean;

    /** An empty string is a value the text filter can match, so only a scalar filter widens absence beyond `null`. */
    protected isNullValue(cellValue: unknown): boolean {
        return cellValue == null;
    }

    /**
     * Once per key, never per row: a log call formats its message and doc URL before the once-per-message guard
     * discards the duplicate. A Custom Filter Option owns its key, so a skipped predicate is a missing value.
     */
    protected warnUnexpectedFilterType(type?: FilterOptionKey | null): void {
        if (this.optionsFactory.getCustomOption(type) || this.warnedKeys.has(type)) {
            return;
        }
        this.warnedKeys.add(type);
        this.warn(76, { filterModelType: type });
    }

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
        optionsFactory.init(this.beans.log, filterParams, this.defaultOptions);

        this.filterModelFormatter = this.createManagedBean(
            this.createModelFormatter(optionsFactory, filterParams, params.column)
        );

        this.updateParams(params);

        this.validateModel(params);
    }

    public refresh(params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>): void {
        if (params.source === 'colDef') {
            const filterParams = params.filterParams;
            const optionsFactory = this.optionsFactory;
            optionsFactory.refresh(this.beans.log, filterParams, this.defaultOptions);
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

        // A model joining no conditions constrains nothing, where `OR` would instead fail every row.
        if (!models.length) {
            return true;
        }

        const combineFunction = operator && operator === 'OR' ? 'some' : 'every';

        const cellValue = this.params.getValue(params.node);

        return models[combineFunction]((m) => this.individualConditionPasses(params, m, cellValue));
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
        const {
            model,
            filterParams: { maxNumConditions },
        } = params;

        if (model == null) {
            return;
        }

        const isCombined = isCombinedFilterModel(model);

        // A hand-written combined model can omit `conditions`; read as empty so the caller gets back what they set.
        let conditions: TModel[] = (isCombined ? model.conditions : [model]) ?? [];

        const filterType = this.filterType;
        let needsUpdate = model.filterType !== filterType;

        const conditionLimit = getConditionLimit(maxNumConditions);
        if (conditionLimit !== null && conditions.length > conditionLimit) {
            conditions = conditions.slice(0, conditionLimit);
            needsUpdate = true;
        }

        const ownConditions: TModel[] = [];
        for (let i = 0, len = conditions.length; i < len; ++i) {
            const condition = conditions[i];
            const ownCondition = this.toOwnCondition(condition, model.filterType);
            if (ownCondition === null) {
                this.params = {
                    ...params,
                    model: null,
                };
                params.onModelChange(null);
                return;
            }
            if (ownCondition !== condition) {
                needsUpdate = true;
            }
            ownConditions.push(ownCondition);
        }
        conditions = ownConditions;

        if (needsUpdate) {
            let updatedModel: TModel | ICombinedSimpleModel<TModel>;
            if (conditions.length === 1) {
                updatedModel = { ...conditions[0], filterType };
            } else {
                // Zero conditions stays combined: collapsing would invent a lone condition with no type, and
                // a list the caller never set is not one to hand back.
                updatedModel = { ...(model as ICombinedSimpleModel<TModel>), filterType };
                if (isCombined && model.conditions) {
                    updatedModel.conditions = conditions;
                }
            }
            this.params = {
                ...params,
                model: updatedModel,
            };
            params.onModelChange(updatedModel);
        }
    }

    /** The condition as this filter's model holds it, or `null` when this filter cannot apply it. */
    private toOwnCondition(condition: TModel, modelFilterType: string | undefined): TModel | null {
        const optionsFactory = this.optionsFactory;
        const type = condition.type;
        // Checked against the list the dropdown is built from, so a malformed option does not count as offered.
        if (!optionsFactory.hasOption(type)) {
            return null;
        }

        const filterType = this.filterType;
        const conditionFilterType = condition.filterType ?? modelFilterType;
        if (conditionFilterType == null || conditionFilterType === filterType) {
            return condition.filterType === filterType ? condition : { ...condition, filterType };
        }

        // Another filter type's values apply only where each input the operator needs converts without loss.
        const foreignCondition: ForeignSimpleFilterModel = condition;
        const numberOfInputs = getNumberOfInputs(type, optionsFactory);
        if (numberOfInputs === 0) {
            return { ...condition, filterType };
        }
        const filter = this.toOwnModelValue(foreignCondition.filter);
        if (filter === null) {
            return null;
        }
        if (numberOfInputs === 1) {
            return { ...condition, filterType, filter };
        }
        const filterTo = this.toOwnModelValue(foreignCondition.filterTo);
        return filterTo === null ? null : { ...condition, filterType, filter, filterTo };
    }

    /** Another filter type's model value as this filter's model holds it, or `null` when it does not convert exactly. */
    protected abstract toOwnModelValue(value: unknown): string | number | null;

    /** returns true if the row passes the said condition */
    private individualConditionPasses(params: IDoesFilterPassParams, filterModel: TModel, cellValue: any) {
        const optionsFactory = this.optionsFactory;
        const values = this.mapValuesFromModel(filterModel, optionsFactory);
        const customFilterOption = optionsFactory.getCustomOption(filterModel.type);

        const customFilterResult = evaluateCustomFilter<TValue>(
            customFilterOption,
            values,
            cellValue,
            this.beans.gos,
            this.params.column
        );
        if (customFilterResult != null) {
            return customFilterResult;
        }

        if (this.isNullValue(cellValue)) {
            return this.evaluateNullValue(filterModel.type);
        }

        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    }
}
