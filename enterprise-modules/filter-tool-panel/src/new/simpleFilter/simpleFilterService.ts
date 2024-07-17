import type {
    AgColumn,
    BeanCollection,
    DataTypeService,
    DateFilterModel,
    ICombinedSimpleModel,
    ISimpleFilterModel,
    ISimpleFilterModelType,
    JoinOperator,
    TextFilterModel,
} from '@ag-grid-community/core';
import { BeanStub, _missingOrEmpty, _warnOnce } from '@ag-grid-community/core';

import type { FilterPanelTranslationService } from '../filterPanelTranslationService';
import type { DoubleInputFilterCondition, FilterCondition, SimpleFilterParams } from '../filterState';
import type { FilterTypeService } from '../iFilterTypeService';
import type { SimpleFilterConfig } from './simpleFilterConfig';

const TEXT_OPTIONS = [
    'contains',
    'notContains',
    'equals',
    'notEqual',
    'startsWith',
    'endsWith',
    'blank',
    'notBlank',
] as const;

const NUMBER_OPTIONS = [
    'equals',
    'notEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'inRange',
    'blank',
    'notBlank',
] as const;

const DATE_OPTIONS = ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange', 'blank', 'notBlank'] as const;

export class SimpleFilterService
    extends BeanStub
    implements
        FilterTypeService<
            SimpleFilterParams,
            ISimpleFilterModel | ICombinedSimpleModel<ISimpleFilterModel>,
            SimpleFilterConfig
        >
{
    private translationService: FilterPanelTranslationService;
    private dataTypeService?: DataTypeService;

    public wireBeans(beans: BeanCollection): void {
        this.translationService = beans.filterPanelTranslationService as FilterPanelTranslationService;
        this.dataTypeService = beans.dataTypeService;
    }

    public getParams<M extends ISimpleFilterModel>(
        filterConfig: SimpleFilterConfig,
        model?: M | ICombinedSimpleModel<M> | null
    ): SimpleFilterParams {
        const {
            maxNumConditions,
            numAlwaysVisibleConditions,
            defaultJoinOperator,
            defaultOption,
            options,
            readOnly: disabled,
            filterType,
        } = filterConfig;
        let joinOperator: JoinOperator = defaultJoinOperator;
        let conditions: FilterCondition[] = [];
        if (model) {
            const mapModelCondition = (modelCondition: M): FilterCondition => {
                const { type } = modelCondition;
                const option = type ?? defaultOption;
                const { from, to } = this.getFilterValues(modelCondition);
                return this.createFilterCondition<any>(option, disabled, from, to);
            };
            const isCombined = (model as ICombinedSimpleModel<M>)?.operator;
            if (isCombined) {
                const { conditions: modelConditions, operator } = model as ICombinedSimpleModel<M>;
                joinOperator = operator;
                conditions = modelConditions.map((condition) => mapModelCondition(condition));
            } else {
                conditions.push(mapModelCondition(model as M));
            }
        }
        conditions.push(this.createFilterCondition(defaultOption, disabled));
        conditions.splice(maxNumConditions);
        for (let i = conditions.length; i < numAlwaysVisibleConditions; i++) {
            conditions.push(this.createFilterCondition(defaultOption, true));
        }

        return {
            conditions,
            joinOperator: {
                operator: joinOperator,
                disabled,
            },
            options: options.map((value: ISimpleFilterModelType) => ({
                value,
                text: this.translationService.translate(value),
            })),
            filterType,
        };
    }

    public updateParams(
        oldSimpleFilterParams: SimpleFilterParams | undefined,
        newSimpleFilterParams: SimpleFilterParams,
        filterConfig: SimpleFilterConfig
    ): SimpleFilterParams {
        if (!oldSimpleFilterParams) {
            return newSimpleFilterParams;
        }
        const { conditions } = newSimpleFilterParams;
        const { conditions: oldConditions } = oldSimpleFilterParams;
        const { maxNumConditions, numAlwaysVisibleConditions, defaultOption } = filterConfig;
        let lastCompleteCondition = -1;
        conditions.forEach((condition, index) => {
            if (this.isConditionComplete(condition)) {
                lastCompleteCondition = index;
            }
        });
        const disableFrom = lastCompleteCondition + 2;
        const removeFrom = Math.max(disableFrom, numAlwaysVisibleConditions);

        const processedConditions: FilterCondition[] = [];

        conditions.forEach((newCondition, index) => {
            if (index >= removeFrom) {
                return;
            }
            const oldCondition = oldConditions[index];
            const disabled = index >= disableFrom;
            if (
                (oldCondition === newCondition || oldCondition.option === newCondition.option) &&
                disabled === oldCondition.disabled
            ) {
                processedConditions.push(newCondition);
                return;
            }
            const { option, from, to } = newCondition as DoubleInputFilterCondition;
            processedConditions.push(this.createFilterCondition(option, disabled, from, to));
        });
        if (processedConditions.length === lastCompleteCondition + 1 && processedConditions.length < maxNumConditions) {
            processedConditions.push(this.createFilterCondition(defaultOption));
        }
        return {
            ...newSimpleFilterParams,
            conditions: processedConditions,
        };
    }

    public getFilterConfig(column: AgColumn): SimpleFilterConfig {
        const params = column.getColDef().filterParams ?? {};
        const { buttons, readOnly } = params;
        let { maxNumConditions, numAlwaysVisibleConditions, defaultJoinOperator, defaultOption } = params;
        maxNumConditions ??= 2;
        if (maxNumConditions < 1) {
            _warnOnce('"filterParams.maxNumConditions" must be greater than or equal to zero.');
            maxNumConditions = 1;
        }
        numAlwaysVisibleConditions ??= 1;
        if (numAlwaysVisibleConditions < 1) {
            _warnOnce('"filterParams.numAlwaysVisibleConditions" must be greater than or equal to zero.');
            numAlwaysVisibleConditions = 1;
        }
        if (numAlwaysVisibleConditions > maxNumConditions) {
            _warnOnce(
                '"filterParams.numAlwaysVisibleConditions" cannot be greater than "filterParams.maxNumConditions".'
            );
            numAlwaysVisibleConditions = maxNumConditions;
        }
        const filterType = this.getFilterType(column);
        const options = this.getOptions(filterType);
        defaultJoinOperator =
            defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
        if (!defaultOption) {
            defaultOption = options[0];
        }
        const applyOnChange = !buttons?.includes('apply');
        return {
            maxNumConditions,
            numAlwaysVisibleConditions,
            options,
            defaultJoinOperator,
            defaultOption,
            applyOnChange,
            filterType,
            readOnly,
        };
    }

    public getModel<M extends ISimpleFilterModel>(params: SimpleFilterParams): M | ICombinedSimpleModel<M> | null {
        const {
            conditions,
            joinOperator: { operator },
            filterType,
        } = params;
        const processedConditions: M[] = [];
        conditions.forEach((condition) => {
            if (this.isConditionComplete(condition)) {
                const { option } = condition;
                const processedCondition: M = {
                    filterType,
                    type: option as ISimpleFilterModelType,
                } as any;
                if (condition.numberOfInputs !== 0) {
                    const fromKey = filterType === 'date' ? 'dateFrom' : 'filter';
                    (processedCondition as any)[fromKey] = condition.from;
                }
                if (condition.numberOfInputs === 2) {
                    const toKey = filterType === 'date' ? 'dateTo' : 'filterTo';
                    (processedCondition as any)[toKey] = condition.to;
                }
                processedConditions.push(processedCondition);
            }
        });
        const numConditions = processedConditions.length;
        if (numConditions === 0) {
            return null;
        }
        if (numConditions === 1) {
            return processedConditions[0];
        }
        return {
            filterType,
            conditions: processedConditions,
            operator,
        };
    }

    public getSummary<M extends ISimpleFilterModel>(model: M | ICombinedSimpleModel<M> | null): string {
        if (model === null) {
            return this.translationService.translate('filterSummaryInactive');
        }
        const isCombined = (model as ICombinedSimpleModel<M>).operator;
        const getSummary = (model: M) => {
            const { type } = model;
            const { from, to } = this.getFilterValues(model);
            const translatedType = this.translationService.translate(type as ISimpleFilterModelType);
            const numberOfInputs = this.getNumberOfInputs(type);
            if (numberOfInputs === 2) {
                return `${translatedType} '${from}' '${to}'`;
            }
            if (numberOfInputs === 1) {
                return `${translatedType} '${from}'`;
            }
            return translatedType;
        };
        if (isCombined) {
            const combinedModel = model as ICombinedSimpleModel<M>;
            return combinedModel.conditions.map((simpleModel) => getSummary(simpleModel)).join(combinedModel.operator);
        } else {
            const simpleModel = model as M;
            return getSummary(simpleModel);
        }
    }

    private getNumberOfInputs(type?: ISimpleFilterModelType | null): 0 | 1 | 2 {
        const zeroInputTypes: ISimpleFilterModelType[] = ['empty', 'notBlank', 'blank'];

        if (type && zeroInputTypes.indexOf(type) >= 0) {
            return 0;
        } else if (type === 'inRange') {
            return 2;
        }

        return 1;
    }

    private createFilterCondition<TValue>(
        option: string,
        disabled?: boolean,
        from?: TValue | null,
        to?: TValue | null
    ): FilterCondition<TValue> {
        const numberOfInputs = this.getNumberOfInputs(option as ISimpleFilterModelType);
        const condition: FilterCondition<TValue> = {
            option,
            disabled,
            numberOfInputs,
        } as any;

        if (numberOfInputs !== 0) {
            const doubleCondition = condition as DoubleInputFilterCondition<TValue>;
            doubleCondition.from = from;
            if (numberOfInputs === 1) {
                doubleCondition.fromPlaceholder = this.translationService.translate('filterOoo');
                doubleCondition.fromAriaLabel = this.translationService.translate('ariaFilterValue');
            }
            if (numberOfInputs === 2) {
                doubleCondition.to = to;
                doubleCondition.fromPlaceholder = this.translationService.translate('inRangeStart');
                doubleCondition.fromAriaLabel = this.translationService.translate('ariaFilterFromValue');
                doubleCondition.toPlaceholder = this.translationService.translate('inRangeEnd');
                doubleCondition.toAriaLabel = this.translationService.translate('ariaFilterToValue');
            }
        }
        return condition;
    }

    private getFilterType(column: AgColumn): 'text' | 'number' | 'date' {
        const baseDataType = this.dataTypeService?.getBaseDataType(column) ?? 'text';
        switch (baseDataType) {
            case 'number':
                return 'number';
            case 'date':
            case 'dateString':
                return 'date';
        }
        return 'text';
    }

    private getOptions(filterType: 'text' | 'number' | 'date'): readonly string[] {
        switch (filterType) {
            case 'date':
                return DATE_OPTIONS;
            case 'number':
                return NUMBER_OPTIONS;
        }
        return TEXT_OPTIONS;
    }

    private getFilterValues<TValue, M extends ISimpleFilterModel>(
        model: M
    ): { from?: TValue | null; to?: TValue | null } {
        if (model.filterType === 'date') {
            const { dateFrom, dateTo }: DateFilterModel = model as any;
            const parseDate = (value?: string | null) => {
                if (value == null) {
                    return value;
                }
                return value.split(' ')[0];
            };
            return {
                from: parseDate(dateFrom),
                to: parseDate(dateTo),
            } as any;
        }
        const { filter: from, filterTo: to }: TextFilterModel = model as any;
        return {
            from,
            to,
        } as any;
    }

    private isConditionComplete(condition: FilterCondition): boolean {
        return (
            condition.numberOfInputs === 0 ||
            (!_missingOrEmpty(condition.from) && (condition.numberOfInputs === 1 || !_missingOrEmpty(condition.to)))
        );
    }
}
