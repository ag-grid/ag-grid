import { _getOwn } from 'ag-stack';

import type { Column } from '../../../interfaces/iColumn';
import type { FilterHandlerParams, IDoesFilterPassParams } from '../../../interfaces/iFilter';
import type { FilterOptionKey, ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { isCombinedFilterModel } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterHandler } from '../simpleFilterHandler';
import { _hasValue, _isBlank, filterCallbackParams } from '../simpleFilterUtils';
import type { ITextFilterParams, TextFilterModel, TextFormatter, TextMatcher } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';
import {
    TEXT_COMPARISONS,
    defaultLowercaseFormatter,
    mapValuesFromTextFilterModel,
    trimInputForFilter,
} from './textFilterUtils';

const defaultMatcher: TextMatcher = ({ filterOption, value, filterText }) => {
    // A `textFormatter` may return null for either side, and every comparison would throw on one.
    if (filterText == null || value == null) {
        return false;
    }
    const compare = filterOption == null ? undefined : _getOwn(TEXT_COMPARISONS, filterOption);
    return compare ? compare(value, filterText) : false;
};

const defaultFormatter: TextFormatter = (from: string) => from;

export class TextFilterHandler extends SimpleFilterHandler<TextFilterModel, string, ITextFilterParams> {
    public readonly filterType = 'text' as const;
    private matcher: TextMatcher;
    private formatter: TextFormatter;
    /** The column's own formatter, bound to name this filter as the caller; absent where none is configured. */
    private textFormatter: TextFormatter | undefined;

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

        const textFormatter = filterParams.textFormatter;
        this.matcher = filterParams.textMatcher ?? defaultMatcher;
        // Absent input has nothing to format, which also keeps the column's own formatter off `null`.
        this.textFormatter =
            textFormatter &&
            ((from) =>
                from == null
                    ? null
                    : textFormatter(from, filterCallbackParams(this.beans.gos, params.column, 'columnFilter')));
        this.formatter =
            this.textFormatter ?? (filterParams.caseSensitive ? defaultFormatter : defaultLowercaseFormatter);
    }

    /** The key is checked rather than the matcher's answer, which cannot distinguish "no match" from "unknown". */
    private isUnmatchable(type?: FilterOptionKey | null): boolean {
        return this.matcher === defaultMatcher && (type == null || !_getOwn(TEXT_COMPARISONS, type));
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
        const { api, colDef, column, context } = this.params;

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
            textFormatter: this.textFormatter,
            source: 'columnFilter' as const,
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
