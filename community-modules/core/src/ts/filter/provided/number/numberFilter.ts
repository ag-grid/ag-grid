import { RefSelector } from '../../../widgets/componentAnnotations';
import { _ } from '../../../utils';
import { ConditionPosition, ISimpleFilterModel, Tuple } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import { makeNull } from '../../../utils/generic';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { isBrowserChrome, isBrowserEdge } from '../../../utils/browser';

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
    // @todo(AG-3453): uncomment.
    // /**
    //  * If more than two inputs, the remaining input values.
    //  */
    // filterRest?: Tuple<number>;
}

export interface INumberFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text` instead of `number`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match, in supported browsers (all except Safari).
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     */
    numberParser?: (text: string | null) => number;
}

export class NumberFilter extends ScalarFilter<NumberFilterModel, number> {
    public static DEFAULT_FILTER_OPTIONS = [
        ScalarFilter.EQUALS,
        ScalarFilter.NOT_EQUAL,
        ScalarFilter.LESS_THAN,
        ScalarFilter.LESS_THAN_OR_EQUAL,
        ScalarFilter.GREATER_THAN,
        ScalarFilter.GREATER_THAN_OR_EQUAL,
        ScalarFilter.IN_RANGE
    ];

    private readonly maxInputs = 2;
    @RefSelector('eValue-index0-1') private readonly eValueFrom1: AgInputTextField;
    @RefSelector('eValue-index1-1') private readonly eValueTo1: AgInputTextField;

    @RefSelector('eValue-index0-2') private readonly eValueFrom2: AgInputTextField;
    @RefSelector('eValue-index1-2') private readonly eValueTo2: AgInputTextField;

    private numberFilterParams: INumberFilterParams;

    constructor() {
        super('numberFilter');
    }

    protected mapValuesFromModel(filterModel: NumberFilterModel | null): Tuple<number> {
        const result: Tuple<number> = [];

        if (filterModel) {
            if (filterModel.filter) {
                result.push(filterModel.filter);
            }
            if (filterModel.filterTo) {
                result.push(filterModel.filterTo);
            }
            // @todo(AG-3453): uncomment.
            // if (filterModel.filterRest) {
            //     result.push(...filterModel.filterRest);
            // }
        }

        return result;
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

    protected setParams(params: INumberFilterParams): void {
        this.numberFilterParams = params;

        const allowedCharPattern = this.getAllowedCharPattern();

        if (allowedCharPattern) {
            const config = { allowedCharPattern };

            this.resetTemplate({
                eValueFrom1: config,
                eValueTo1: config,
                eValueFrom2: config,
                eValueTo2: config,
            });
        }

        super.setParams(params);
    }

    protected resetPlaceholder(): void {
        const globalTranslate = this.gridOptionsWrapper.getLocaleTextFunc();

        this.forEachInput((element, index, _, numberOfInputs) => {
            const placeholder =
                index === 0 && numberOfInputs > 1 ? 'inRangeStart' : 
                index === 0 ? 'filterOoo' :
                'inRangeEnd';
            const ariaLabel = 
                index === 0 && numberOfInputs > 1 ? globalTranslate('ariaFilterFromValue', 'Filter from value') : 
                index === 0 ? globalTranslate('ariaFilterValue', 'Filter Value') :
                globalTranslate('ariaFilterToValue', 'Filter to Value');

            element.setInputPlaceholder(this.translate(placeholder));
            element.setInputAriaLabel(ariaLabel)
        });
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected createValueTemplate(position: ConditionPosition): string {
        const pos = position === ConditionPosition.One ? '1' : '2';
        const allowedCharPattern = this.getAllowedCharPattern();
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
                result.push(this.stringToFloat(element.getValue()));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return aSimple.filter === bSimple.filter
            && aSimple.filterTo === bSimple.filterTo
            && aSimple.type === bSimple.type;
            // @todo(AG-3453): uncomment.
            // && _.every(aSimple.filterRest || [], (v, index) => v === (bSimple.filterRest || [])[index]);
    }

    protected getFilterType(): 'number' {
        return 'number';
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
        // @todo(AG-3453): uncomment.
        // if (values.length > 2) {
        //     model.filterRest = values.slice(2);
        // }

        return model;
    }

    protected updateUiVisibility(): void {
        super.updateUiVisibility();

        this.resetPlaceholder();
    }

    protected getInputs(): Tuple<AgInputTextField>[] {
        return [
            [this.eValueFrom1, this.eValueTo1],
            [this.eValueFrom2, this.eValueTo2],
        ];
    }

    private getAllowedCharPattern(): string | null {
        const { allowedCharPattern } = this.numberFilterParams || {};

        if (allowedCharPattern) {
            return allowedCharPattern;
        }

        if (!isBrowserChrome() && !isBrowserEdge()) {
            // only Chrome and Edge support the HTML5 number field, so for other browsers we provide an equivalent
            // constraint instead
            return '\\d\\-\\.';
        }

        return null;
    }
}
