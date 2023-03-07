import { RefSelector } from '../../../widgets/componentAnnotations';
import { ConditionPosition, ISimpleFilterModel, SimpleFilter, SimpleFilterModelFormatter, Tuple } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { makeNull } from '../../../utils/generic';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isBrowserChrome } from '../../../utils/browser';
import { IFilterOptionDef, IFilterParams } from '../../../interfaces/iFilter';

export interface NumberFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'number'` */
    filterType?: 'number';
    /**
     * The number value(s) associated with the filter.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to).
     */
    filter?: number | null;
    /**
     * Range filter `to` value.
     */
    filterTo?: number | null;
}

/**
 * Parameters provided by the grid to the `init` method of a `NumberFilter`.
 * Do not use in `colDef.filterParams` - see `INumberFilterParams` instead.
 */
export type NumberFilterParams<TData = any> = INumberFilterParams & IFilterParams<TData>;

/**
 * Parameters used in `colDef.filterParams` to configure a Number Filter (`agNumberColumnFilter`).
 */
export interface INumberFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match.
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     */
    numberParser?: (text: string | null) => number | null;
}

export class NumberFilterModelFormatter extends SimpleFilterModelFormatter {
    protected conditionToString(condition: NumberFilterModel, options?: IFilterOptionDef): string {
        const { numberOfInputs } = options || {};
        const isRange = condition.type == SimpleFilter.IN_RANGE || numberOfInputs === 2;

        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        }

        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return `${condition.filter}`;
        }

        return `${condition.type}`;
    }
}

export function getAllowedCharPattern(filterParams?: NumberFilterParams): string | null {
    const { allowedCharPattern } = filterParams ?? {};

    if (allowedCharPattern) {
        return allowedCharPattern;
    }

    if (!isBrowserChrome()) {
        // only Chrome and Edge (Chromium) have nice HTML5 number field handling, so for other browsers we provide an equivalent
        // constraint instead
        return '\\d\\-\\.';
    }

    return null;
}

export class NumberFilter extends ScalarFilter<NumberFilterModel, number> {
    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.LESS_THAN,
        ScalarFilter.LESS_THAN_OR_EQUAL,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.GREATER_THAN_OR_EQUAL,
        ScalarFilter.IN_RANGE,
        ScalarFilter.BLANK,
        ScalarFilter.NOT_BLANK,
    ];

    @RefSelector('eValue-index0-1') private readonly eValueFrom1: AgInputTextField;
    @RefSelector('eValue-index1-1') private readonly eValueTo1: AgInputTextField;

    @RefSelector('eValue-index0-2') private readonly eValueFrom2: AgInputTextField;
    @RefSelector('eValue-index1-2') private readonly eValueTo2: AgInputTextField;

    private numberFilterParams: NumberFilterParams;
    private filterModelFormatter: SimpleFilterModelFormatter;

    constructor() {
        super('numberFilter');
    }

    protected mapValuesFromModel(filterModel: NumberFilterModel | null): Tuple<number> {
        const { filter, filterTo, type } = filterModel || {};
        return [
            this.processValue(filter),
            this.processValue(filterTo),
        ].slice(0, this.getNumberOfInputs(type));
    }

    protected getDefaultDebounceMs(): number {
        return 500;
    }

    protected comparator(): Comparator<number> {
        return (left: number, right: number): number => {
            if (left === right) { return 0; }

            return left < right ? 1 : -1;
        };
    }

    protected setParams(params: NumberFilterParams): void {
        this.numberFilterParams = params;

        const allowedCharPattern = getAllowedCharPattern(this.numberFilterParams);

        if (allowedCharPattern) {
            const config = { allowedCharPattern };

            this.resetTemplate({
                'eValue-index0-1': config,
                'eValue-index1-1': config,
                'eValue-index0-2': config,
                'eValue-index1-2': config,
            });
        }

        super.setParams(params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';
        const allowedCharPattern = getAllowedCharPattern(this.numberFilterParams);
        const agElementTag = allowedCharPattern ? 'ag-input-text-field' : 'ag-input-number-field';

        return /* html */`
            <div class="ag-filter-body" ref="eCondition${pos}Body" role="presentation">
                <${agElementTag} class="ag-filter-from ag-filter-filter" ref="eValue-index0-${pos}"></${agElementTag}>
                <${agElementTag} class="ag-filter-to ag-filter-filter" ref="eValue-index1-${pos}"></${agElementTag}>
            </div>`;
    }

    protected getValues(position: ConditionPosition): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (position === elPosition && index < numberOfInputs) {
                result.push(this.processValue(this.stringToFloat(element.getValue())));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
    }

    protected getFilterType(): 'number' {
        return 'number';
    }

    private processValue(value?: number | null): number | null {
        if (value == null) {
            return null;
        }
        return isNaN(value) ? null : value;
    }

    private stringToFloat(value?: string | number | null): number | null {
        if (typeof value === 'number') {
            return value;
        }

        let filterText = makeNull(value);

        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }

        if (this.numberFilterParams.numberParser) {
            return this.numberFilterParams.numberParser(filterText);
        }

        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    }

    protected createCondition(position: ConditionPosition): NumberFilterModel {
        const type = this.getConditionTypes()[position];
        const model: NumberFilterModel = {
            filterType: this.getFilterType(),
            type
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = values[0];
        }
        if (values.length > 1) {
            model.filterTo = values[1];
        }

        return model;
    }

    protected getInputs(): Tuple<AgInputTextField>[] {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    }

    public getModelAsString(model: ISimpleFilterModel): string {
        return this.filterModelFormatter.getModelAsString(model) ?? '';
    }
}
