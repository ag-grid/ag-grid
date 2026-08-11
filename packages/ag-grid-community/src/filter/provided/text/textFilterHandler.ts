import type { FilterHandlerParams, IDoesFilterPassParams } from '../../../interfaces/iFilter';
import type { FilterOptionKey, ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { isCombinedFilterModel } from '../iSimpleFilter';
import { SimpleFilterHandler } from '../simpleFilterHandler';
import { isBlank } from '../simpleFilterUtils';
import type { ITextFilterParams, TextFilterModel, TextFormatter, TextMatcher } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';
import { mapValuesFromTextFilterModel, trimInputForFilter } from './textFilterUtils';

const FILTER_TYPES_ALLOWING_NULLS: ReadonlySet<FilterOptionKey> = new Set(['notEqual', 'notContains', 'blank']);

/** The keys the built-in matching answers; anything else needs a `textMatcher` or a custom option's `predicate`. */
const MATCHED_KEYS: ReadonlySet<string> = new Set(DEFAULT_TEXT_FILTER_OPTIONS);

const defaultMatcher: TextMatcher = ({ filterOption, value, filterText }) => {
    if (filterText == null) {
        return false;
    }

    switch (filterOption) {
        case 'contains':
            return value.includes(filterText);
        case 'notContains':
            return !value.includes(filterText);
        case 'equals':
            return value === filterText;
        case 'notEqual':
            return value != filterText;
        case 'startsWith':
            return value.indexOf(filterText) === 0;
        case 'endsWith': {
            const index = value.lastIndexOf(filterText);
            return index >= 0 && index === value.length - filterText.length;
        }
        default:
            return false;
    }
};

const defaultFormatter: TextFormatter = (from: string) => from;

const defaultLowercaseFormatter: TextFormatter = (from: string) =>
    from == null ? null : from.toString().toLowerCase();

export class TextFilterHandler extends SimpleFilterHandler<TextFilterModel, string, ITextFilterParams> {
    public readonly filterType = 'text' as const;
    protected readonly FilterModelFormatterClass = TextFilterModelFormatter;
    private matcher: TextMatcher;
    private formatter: TextFormatter;

    constructor() {
        super(mapValuesFromTextFilterModel, DEFAULT_TEXT_FILTER_OPTIONS);
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
        this.formatter =
            filterParams.textFormatter ?? (filterParams.caseSensitive ? defaultFormatter : defaultLowercaseFormatter);
    }

    protected override evaluateNullValue(filterType: FilterOptionKey | null) {
        return filterType != null && FILTER_TYPES_ALLOWING_NULLS.has(filterType);
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
        if (type === 'blank') {
            return isBlank(cellValue);
        } else if (type === 'notBlank') {
            return !isBlank(cellValue);
        }

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

        const matcher = this.matcher;
        // A zero-value option never reaches the matcher, so the key is checked rather than its answer.
        if (matcher === defaultMatcher && (type == null || !MATCHED_KEYS.has(type))) {
            this.warn(76, { filterModelType: type });
            return false;
        }
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
