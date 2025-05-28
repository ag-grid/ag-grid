import type { FilterHandlerParams, IDoesFilterPassParams } from '../../../interfaces/iFilter';
import type { ICombinedSimpleModel, ISimpleFilterModelType, Tuple } from '../iSimpleFilter';
import { SimpleFilterHandler } from '../simpleFilterHandler';
import { isBlank } from '../simpleFilterUtils';
import type { ITextFilterParams, TextFilterModel, TextFormatter, TextMatcher } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';
import { mapValuesFromTextFilterModel } from './textFilterUtils';

const defaultMatcher: TextMatcher = ({ filterOption, value, filterText }) => {
    if (filterText == null) {
        return false;
    }

    switch (filterOption) {
        case 'contains':
            return value.indexOf(filterText) >= 0;
        case 'notContains':
            return value.indexOf(filterText) < 0;
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
    protected readonly FilterModelFormatterClass = TextFilterModelFormatter;
    private matcher: TextMatcher;
    private formatter: TextFormatter;

    constructor() {
        super(mapValuesFromTextFilterModel, DEFAULT_TEXT_FILTER_OPTIONS);
    }

    protected override updateParams(
        params: FilterHandlerParams<any, any, TextFilterModel | ICombinedSimpleModel<TextFilterModel>> &
            ITextFilterParams
    ): void {
        super.updateParams(params);

        this.matcher = params.textMatcher ?? defaultMatcher;
        this.formatter = params.textFormatter ?? (params.caseSensitive ? defaultFormatter : defaultLowercaseFormatter);
    }

    protected override evaluateNullValue(filterType: ISimpleFilterModelType | null) {
        const filterTypesAllowNulls: ISimpleFilterModelType[] = ['notEqual', 'notContains', 'blank'];

        return filterType ? filterTypesAllowNulls.indexOf(filterType) >= 0 : false;
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

        if (filterModel.type === 'blank') {
            return isBlank(cellValue);
        } else if (filterModel.type === 'notBlank') {
            return !isBlank(cellValue);
        }

        const matcherParams = {
            api,
            colDef,
            column,
            context,
            node: params.node,
            data: params.data,
            filterOption: filterModel.type,
            value: cellValueFormatted,
            textFormatter,
        };

        return formattedValues.some((v) => this.matcher({ ...matcherParams, filterText: v }));
    }
}
