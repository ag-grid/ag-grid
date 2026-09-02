import type { Column } from '../../../interfaces/iColumn';
import type { FilterHandlerParams, IDoesFilterPassParams } from '../../../interfaces/iFilter';
import type { FilterOptionKey, ICombinedSimpleModel, TextFilterOptionKey, Tuple } from '../iSimpleFilter';
import { isCombinedFilterModel } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterHandler } from '../simpleFilterHandler';
import { _hasValue, _isBlank } from '../simpleFilterUtils';
import type { ITextFilterParams, TextFilterModel, TextFormatter, TextMatcher } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';
import { mapValuesFromTextFilterModel, trimInputForFilter } from './textFilterUtils';

/** Every key `defaultMatcher` answers; anything else needs a `textMatcher` to mean something. */
const DEFAULT_MATCHER_KEYS: ReadonlySet<string> = new Set<TextFilterOptionKey>([
    'contains',
    'notContains',
    'equals',
    'notEqual',
    'startsWith',
    'endsWith',
]);

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
        this.formatter =
            filterParams.textFormatter ?? (filterParams.caseSensitive ? defaultFormatter : defaultLowercaseFormatter);
    }

    /** The key is checked rather than the matcher's answer, which cannot distinguish "no match" from "unknown". */
    private isUnmatchable(type?: FilterOptionKey | null): boolean {
        return this.matcher === defaultMatcher && (type == null || !DEFAULT_MATCHER_KEYS.has(type));
    }

    protected override evaluateNullValue(filterType: FilterOptionKey | null) {
        // Presence is decided without the matcher, so an unusable key is reported for a blank column too.
        if (filterType !== 'blank' && filterType !== 'notBlank' && this.isUnmatchable(filterType)) {
            this.warnUnexpectedFilterType(filterType);
            return false;
        }
        return filterType === 'notEqual' || filterType === 'notContains' || filterType === 'blank';
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
            return _isBlank(cellValue);
        } else if (type === 'notBlank') {
            return _hasValue(cellValue);
        }

        if (this.isUnmatchable(type)) {
            this.warnUnexpectedFilterType(type);
            return false;
        }

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
