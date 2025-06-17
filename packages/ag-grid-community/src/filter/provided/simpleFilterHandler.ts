import { BeanStub } from '../../context/beanStub';
import type {
    DoesFilterPassParams,
    FilterHandler,
    FilterHandlerParams,
    IDoesFilterPassParams,
} from '../../interfaces/iFilter';
import type {
    ICombinedSimpleModel,
    ISimpleFilterModel,
    ISimpleFilterModelType,
    ISimpleFilterParams,
    MapValuesFromSimpleFilterModel,
    Tuple,
} from './iSimpleFilter';
import { OptionsFactory } from './optionsFactory';
import type { SimpleFilterModelFormatter } from './simpleFilterModelFormatter';
import { evaluateCustomFilter } from './simpleFilterUtils';

export abstract class SimpleFilterHandler<
        TModel extends ISimpleFilterModel,
        TValue,
        TParams extends ISimpleFilterParams,
    >
    extends BeanStub
    implements FilterHandler<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>
{
    protected abstract readonly FilterModelFormatterClass: new (
        optionsFactory: OptionsFactory,
        filterParams: ISimpleFilterParams
    ) => SimpleFilterModelFormatter<ISimpleFilterParams>;

    protected params: FilterHandlerParams<any, any, TModel | ICombinedSimpleModel<TModel>, TParams>;
    private optionsFactory: OptionsFactory;
    private filterModelFormatter: SimpleFilterModelFormatter<ISimpleFilterParams>;

    constructor(
        private readonly mapValuesFromModel: MapValuesFromSimpleFilterModel<TModel, TValue>,
        private readonly defaultOptions: string[]
    ) {
        super();
    }

    protected abstract evaluateNullValue(filterType?: ISimpleFilterModelType | null): boolean;

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
        optionsFactory.init(filterParams, this.defaultOptions);

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
            optionsFactory.refresh(filterParams, this.defaultOptions);
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
            filterParams: { filterOptions, maxNumConditions },
        } = params;

        const conditions: TModel[] | null = model ? (<ICombinedSimpleModel<TModel>>model).conditions ?? [model] : null;

        // Invalid when one of the existing condition options is not in new options list
        const newOptionsList =
            filterOptions?.map((option) => (typeof option === 'string' ? option : option.displayKey)) ??
            this.defaultOptions;

        const allConditionsExistInNewOptionsList =
            !conditions ||
            conditions.every((condition) => newOptionsList.find((option) => option === condition.type) !== undefined);

        if (!allConditionsExistInNewOptionsList) {
            this.params = {
                ...params,
                model: null,
            };
            params.onModelChange(null);
            return;
        }

        // Check number of conditions vs maxNumConditions
        if (typeof maxNumConditions === 'number' && conditions && conditions.length > maxNumConditions) {
            const updatedModel = {
                ...(model as ICombinedSimpleModel<TModel>),
                conditions: conditions.slice(0, maxNumConditions),
            };
            this.params = {
                ...params,
                model: updatedModel,
            };
            params.onModelChange(updatedModel);
            return;
        }
    }

    /** returns true if the row passes the said condition */
    private individualConditionPasses(params: IDoesFilterPassParams, filterModel: TModel, cellValue: any) {
        const optionsFactory = this.optionsFactory;
        const values = this.mapValuesFromModel(filterModel, optionsFactory);
        const customFilterOption = optionsFactory.getCustomOption(filterModel.type);

        const customFilterResult = evaluateCustomFilter<TValue>(customFilterOption, values, cellValue);
        if (customFilterResult != null) {
            return customFilterResult;
        }

        if (cellValue == null) {
            return this.evaluateNullValue(filterModel.type);
        }

        return this.evaluateNonNullValue(values, cellValue, filterModel, params);
    }
}
