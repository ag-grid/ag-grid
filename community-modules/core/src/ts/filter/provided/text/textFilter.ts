import { RefSelector } from '../../../widgets/componentAnnotations';
import {
    SimpleFilter,
    ConditionPosition,
    ISimpleFilterParams,
    ISimpleFilterModel,
    ISimpleFilterModelType,
    Tuple
} from '../simpleFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { makeNull } from '../../../utils/generic';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { _ } from '../../../utils';

export interface TextFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'text'` */
    filterType?: 'text';
    /**
     * The text value associated with the filter.
     * It's optional as custom filters may not have a text value.
     * */
    filter?: string | null;
}

export interface TextComparator {
    (filter: string | null | undefined, gridValue: any, filterText: string | null): boolean;
}

export interface TextFormatter {
    (from?: string | null): string | null;
}

export interface ITextFilterParams extends ISimpleFilterParams {
    /** 
     * Used to override how to filter based on the user input.
     */
    textCustomComparator?: TextComparator;
    /** 
     * By default, text filtering is case-insensitive. Set this to `true` to make text filtering case-sensitive.
     * Default: `false`
     */
    caseSensitive?: boolean;
    /** 
     * Formats the text before applying the filter compare logic.
     * Useful if you want to substitute accented characters, for example.
     */
    textFormatter?: (from: string) => string;

    /**
     * If `true`, the input that the user enters will be trimmed when the filter is applied, so any leading or trailing whitespace will be removed.
     * If only whitespace is entered, it will be left as-is.
     * If you enable `trimInput`, it is best to also increase the `debounceMs` to give users more time to enter text.
     * Default: `false`
     */
    trimInput?: boolean;
}

export class TextFilter extends SimpleFilter<TextFilterModel, string> {
    public static DEFAULT_FILTER_OPTIONS = [
        SimpleFilter.CONTAINS,
        SimpleFilter.NOT_CONTAINS,
        SimpleFilter.EQUALS,
        SimpleFilter.NOT_EQUAL,
        SimpleFilter.STARTS_WITH,
        SimpleFilter.ENDS_WITH
    ];

    static DEFAULT_FORMATTER: TextFormatter = (from: string) => from;

    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter = (from: string) => from == null ? null : from.toString().toLowerCase();

    static DEFAULT_COMPARATOR: TextComparator = (filter: string, value: any, filterText: string) => {
        switch (filter) {
            case TextFilter.CONTAINS:
                return value.indexOf(filterText) >= 0;
            case TextFilter.NOT_CONTAINS:
                return value.indexOf(filterText) < 0;
            case TextFilter.EQUALS:
                return value === filterText;
            case TextFilter.NOT_EQUAL:
                return value != filterText;
            case TextFilter.STARTS_WITH:
                return value.indexOf(filterText) === 0;
            case TextFilter.ENDS_WITH:
                const index = value.lastIndexOf(filterText);
                return index >= 0 && index === (value.length - filterText.length);
            default:
                // should never happen
                console.warn('AG Grid: Unexpected type of filter "' + filter + '", it looks like the filter was configured with incorrect Filter Options');
                return false;
        }
    };

    @RefSelector('eValue1') private readonly eValue1: AgInputTextField;
    @RefSelector('eValue2') private readonly eValue2: AgInputTextField;

    private comparator: TextComparator;
    private formatter: TextFormatter;

    private textFilterParams: ITextFilterParams;

    constructor() {
        super('textFilter');
    }

    public static trimInput(value?: string | null): string | null | undefined {
        const trimmedInput = value && value.trim();

        // trim the input, unless it is all whitespace (this is consistent with Excel behaviour)
        return trimmedInput === '' ? value : trimmedInput;
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    private addValueChangedListeners(): void {
        const listener = () => this.onUiChanged();
        this.eValue1.onValueChange(listener);
        this.eValue2.onValueChange(listener);
    }

    protected setParams(params: ITextFilterParams): void {
        super.setParams(params);

        this.textFilterParams = params;
        this.comparator = this.textFilterParams.textCustomComparator || TextFilter.DEFAULT_COMPARATOR;
        this.formatter = this.textFilterParams.textFormatter ||
            (this.textFilterParams.caseSensitive ? TextFilter.DEFAULT_FORMATTER : TextFilter.DEFAULT_LOWERCASE_FORMATTER);

        this.addValueChangedListeners();
    }

    protected setConditionIntoUi(model: TextFilterModel, position: ConditionPosition): void {
        const positionOne = position === ConditionPosition.One;
        const eValue = positionOne ? this.eValue1 : this.eValue2;

        eValue.setValue(model ? model.filter : null);
    }

    protected createCondition(position: ConditionPosition): TextFilterModel {
        const type = this.getConditionTypes()[position];

        const model: TextFilterModel = {
            filterType: this.getFilterType(),
            type,
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }

        return model;
    }

    protected getFilterType(): 'text' {
        return 'text';
    }

    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean {
        return aSimple.filter === bSimple.filter && aSimple.type === bSimple.type;
    }

    protected resetPlaceholder(): void {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();
        const placeholder = this.translate('filterOoo');

        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(globalTranslate('ariaFilterValue', 'Filter Value'));
        });
    }

    protected getInputs(): Tuple<AgInputTextField>[] {
        return [
            [this.eValue1],
            [this.eValue2],
        ];
    }

    protected getValues(position: ConditionPosition): Tuple<string> {
        const result: Tuple<string> = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                const value = makeNull(element.getValue());
                const cleanValue = (this.textFilterParams.trimInput ? TextFilter.trimInput(value) : value) || null;
                result.push(cleanValue);
                element.setValue(cleanValue, true); // ensure clean value is visible
            }
        });

        return result;
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';

        return /* html */`
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <ag-input-text-field class="ag-filter-filter" ref="eValue${pos}"></ag-input-text-field>
            </div>`;
    }

    protected mapValuesFromModel(filterModel: TextFilterModel): Tuple<string> {
        return [ filterModel.filter || null ];
    }

    protected evaluateNullValue(filterType: ISimpleFilterModelType | null) {
        return filterType === SimpleFilter.NOT_EQUAL || filterType === SimpleFilter.NOT_CONTAINS;
    }

    protected evaluateNonNullValue(values: Tuple<string>, cellValue: string, filterModel: TextFilterModel): boolean {
        const formattedValues = _.map(values, (v) => this.formatter(v)) || [];
        const cellValueFormatted = this.formatter(cellValue);

        return _.some(formattedValues, (v) => this.comparator(filterModel.type, cellValueFormatted, v));
    }
}
