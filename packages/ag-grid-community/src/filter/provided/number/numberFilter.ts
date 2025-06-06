import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/dom';
import { _makeNull } from '../../../utils/generic';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { DEFAULT_NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import { getAllowedCharPattern, mapValuesFromNumberFilterModel, processNumberFilterValue } from './numberFilterUtils';

/** temporary type until `NumberFilterParams` is updated as breaking change */
type NumberFilterDisplayParams = INumberFilterParams &
    FilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>;

export class NumberFilter extends SimpleFilter<
    NumberFilterModel,
    number,
    AgInputTextField | AgInputNumberField,
    NumberFilterDisplayParams
> {
    private readonly eValuesFrom: (AgInputTextField | AgInputNumberField)[] = [];
    private readonly eValuesTo: (AgInputTextField | AgInputNumberField)[] = [];

    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, DEFAULT_NUMBER_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs: number = 500;

    protected override setElementValue(
        element: AgInputTextField | AgInputNumberField,
        value: number | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const { numberFormatter } = this.params;
        const valueToSet = !fromFloatingFilter && numberFormatter ? numberFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any);
    }

    protected createEValue(): HTMLElement {
        const allowedCharPattern = getAllowedCharPattern(this.params);

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        this.createFromToElement(eCondition, this.eValuesFrom, 'from', allowedCharPattern);
        this.createFromToElement(eCondition, this.eValuesTo, 'to', allowedCharPattern);

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eValues: (AgInputTextField | AgInputNumberField)[],
        fromTo: string,
        allowedCharPattern: string | null
    ): void {
        const eValue = this.createManagedBean(
            allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputNumberField()
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: (AgInputTextField | AgInputNumberField)[]) =>
            this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected getValues(position: number): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(processNumberFilterValue(this.stringToFloat(element.getValue())));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    private stringToFloat(value?: string | number | null): number | null {
        if (typeof value === 'number') {
            return value;
        }

        let filterText = _makeNull(value);

        if (filterText != null && filterText.trim() === '') {
            filterText = null;
        }

        const numberParser = this.params.numberParser;
        if (numberParser) {
            return numberParser(filterText);
        }

        return filterText == null || filterText.trim() === '-' ? null : parseFloat(filterText);
    }

    protected createCondition(position: number): NumberFilterModel {
        const type = this.getConditionType(position);
        const model: NumberFilterModel = {
            filterType: this.filterType,
            type,
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

    protected getInputs(position: number): Tuple<AgInputTextField | AgInputNumberField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override hasInvalidInputs(): boolean {
        let invalidInputs = false;
        this.forEachInput((element) => {
            if (!element.getInputElement().validity.valid) {
                invalidInputs = true;
                return;
            }
        });
        return invalidInputs;
    }
}
