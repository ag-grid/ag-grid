import type { Column } from '../../../interfaces/iColumn';
import type { FilterHandlerParams, IDoesFilterPassParams } from '../../../interfaces/iFilter';
import type { FilterOptionKey, ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { isCombinedFilterModel } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterHandler } from '../simpleFilterHandler';
import type { ITextFilterParams, TextFilterModel, TextFormatter, TextMatcher } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';
import {
    _TEXT_FILTER_PREDICATES,
    _getTextFormatter,
    mapValuesFromTextFilterModel,
    trimInputForFilter,
} from './textFilterUtils';

const defaultMatcher: TextMatcher = ({ filterOption, value, filterText }) => {
    if (filterText == null) {
        return false;
    }

    // Dispatched by `switch` rather than by key: this runs per row, and the option set is fixed.
    switch (filterOption) {
        case 'contains':
            return _TEXT_FILTER_PREDICATES.contains(value, filterText);
        case 'notContains':
            return _TEXT_FILTER_PREDICATES.notContains(value, filterText);
        case 'equals':
            return _TEXT_FILTER_PREDICATES.equals(value, filterText);
        case 'notEqual':
            return _TEXT_FILTER_PREDICATES.notEqual(value, filterText);
        case 'startsWith':
            return _TEXT_FILTER_PREDICATES.startsWith(value, filterText);
        case 'endsWith':
            return _TEXT_FILTER_PREDICATES.endsWith(value, filterText);
        default:
            return false;
    }
};

export class TextFilterHandler extends SimpleFilterHandler<TextFilterModel, string, ITextFilterParams> {
    public readonly filterType = 'text' as const;
    private matcher: TextMatcher;
    private formatter: TextFormatter;

    constructor() {
        super(mapValuesFromTextFilterModel, DEFAULT_TEXT_FILTER_OPTIONS);
    }

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: ITextFilterParams,
        column: Column
    ): TextFilterModelFormatter {
        return new TextFilterModelFormatter(optionsFactory, filterParams, column);
    }

    protected override updateParams(
        params: FilterHandlerParams<
            any,
            any,
            TextFilterModel | ICombinedSimpleModel<TextFilterModel>,
            ITextFilterParams
        >
    ): void {
        super.updateParams(params);

        const filterParams = params.filterParams;

        this.matcher = filterParams.textMatcher ?? defaultMatcher;
        this.formatter = _getTextFormatter(filterParams);
    }

    protected override evaluateNullValue(filterType: FilterOptionKey | null) {
        return filterType === 'notEqual' || filterType === 'notContains';
    }

    protected override evaluateNonNullValue(
        values: Tuple<string>,
        cellValue: string,
        filterModel: TextFilterModel,
        params: IDoesFilterPassParams
    ): boolean {
        const formattedValues = values.map((v) => this.formatter(v)) || [];
        const cellValueFormatted = this.formatter(cellValue);
        const {
            api,
            colDef,
            column,
            context,
            filterParams: { textFormatter },
        } = this.params;

        const type = filterModel.type;
        const matcher = this.matcher;
        const matcherParams = {
            api,
            colDef,
            column,
            context,
            node: params.node,
            data: params.data,
            filterOption: type,
            value: cellValueFormatted,
            textFormatter,
        };

        return formattedValues.some((v) => matcher({ ...matcherParams, filterText: v }));
    }

    public processModelToApply(
        model: TextFilterModel | ICombinedSimpleModel<TextFilterModel> | null
    ): TextFilterModel | ICombinedSimpleModel<TextFilterModel> | null {
        if (model && this.params.filterParams.trimInput) {
            const processCondition = (condition: TextFilterModel) => {
                const newCondition = {
                    ...condition,
                };
                const { filter, filterTo } = condition;
                if (filter) {
                    newCondition.filter = trimInputForFilter(filter) ?? null;
                }
                if (filterTo) {
                    newCondition.filterTo = trimInputForFilter(filterTo) ?? null;
                }
                return newCondition;
            };
            if (isCombinedFilterModel(model)) {
                return {
                    ...model,
                    conditions: model.conditions.map(processCondition),
                };
            }
            return processCondition(model);
        }
        return model;
    }
}
