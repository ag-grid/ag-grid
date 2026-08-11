import { AgInputNumberField } from '../../../agWidgets/agInputNumberField';
import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputNumberField, GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';
import { NUMBER_FILTER_OPTIONS } from './numberFilterConstants';
import {
    getAllowedCharPattern,
    mapValuesFromNumberFilterModel,
    processNumberFilterValue,
    readsBackAsSameNumber,
    stringToFloat,
} from './numberFilterUtils';

/** temporary type until `NumberFilterParams` is updated as breaking change */
type NumberFilterDisplayParams = INumberFilterParams &
    FilterDisplayParams<any, any, NumberFilterModel | ICombinedSimpleModel<NumberFilterModel>>;

export class NumberFilter extends SimpleFilter<
    NumberFilterModel,
    number,
    GridInputTextField | GridInputNumberField,
    NumberFilterDisplayParams
> {
    private readonly eValuesFrom: (GridInputTextField | GridInputNumberField)[] = [];
    private readonly eValuesTo: (GridInputTextField | GridInputNumberField)[] = [];
    private allowedCharPattern: string | null;
    /** The parameters the mounted inputs were filled through; their text is only readable through these. */
    private renderedWith: NumberFilterDisplayParams | undefined;

    public readonly filterType = 'number' as const;

    constructor() {
        super('numberFilter', mapValuesFromNumberFilterModel, NUMBER_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    protected override commonUpdateSimpleParams(params: NumberFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);
        this.refreshInputElements(params);
    }

    /** An input's element type is fixed when it is built, so a `colDef` refresh that changes it rebuilds them. */
    private refreshInputElements(params: NumberFilterDisplayParams): void {
        const previous = this.renderedWith;
        this.renderedWith = params;
        const allowedCharPattern = getAllowedCharPattern(params);
        // `allowedCharPattern` is read once when an input is built, and decides its element type with it.
        const rebuild = allowedCharPattern !== this.allowedCharPattern;
        this.allowedCharPattern = allowedCharPattern;
        // What an input shows is rendered through these, so its text stops being readable when they change.
        const rerender =
            rebuild ||
            params.numberParser !== previous?.numberParser ||
            params.numberFormatter !== previous?.numberFormatter;
        const { eValuesFrom, eValuesTo } = this;
        const numConditions = eValuesFrom.length;
        if (!rerender || !numConditions) {
            return;
        }
        const previousParser = previous?.numberParser;
        for (let position = 0; position < numConditions; ++position) {
            this.refreshInputElement(eValuesFrom, position, 'from', rebuild, previousParser);
            this.refreshInputElement(eValuesTo, position, 'to', rebuild, previousParser);
            if (rebuild) {
                this.attachRebuiltInputListeners(eValuesFrom[position], eValuesTo[position]);
            }
        }
        this.updateUiVisibility(); // the replacements start visible and enabled, whatever the condition is
        this.refreshInputValidation();
    }

    /** Read back through the parser that wrote the text, then shown again through the new parameters. */
    private refreshInputElement(
        eValues: (GridInputTextField | GridInputNumberField)[],
        position: number,
        fromTo: string,
        rebuild: boolean,
        previousParser: INumberFilterParams['numberParser']
    ): void {
        const previous = eValues[position];
        const text = previous.getValue();
        const value = processNumberFilterValue(stringToFloat(previousParser, text));
        // Text no parser reads is not a value to render again, it is what the user is still typing.
        const isMidEdit = value == null && text != null && text !== '';
        let element = previous;
        if (rebuild) {
            element = this.createInputElement(fromTo);
            previous.getGui().replaceWith(element.getGui());
            this.destroyBean(previous);
            eValues[position] = element;
        }
        if (isMidEdit) {
            element.setValue(text, true);
        } else {
            this.setElementValue(element, value);
        }
    }

    protected override refreshPositionValidation(position: number, isFrom = false): void {
        const from = this.eValuesFrom[position];
        const to = this.eValuesTo[position];
        const parser = this.params.numberParser;
        const fromValue = getNormalisedValue(parser, from);
        const toValue = getNormalisedValue(parser, to);
        const localeKey = this.isRangeCondition(position) ? getValidityMessageKey(fromValue, toValue, isFrom) : null;
        const validityMessage = localeKey ? this.translate(localeKey, [String(isFrom ? toValue : fromValue)]) : '';
        (isFrom ? from : to).setCustomValidity(validityMessage); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity(''); // Reset validity error state for other input
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'dateFilter');
        }
    }

    protected override getState(): { isInvalid: boolean } {
        // State represents non-model related UI state, so we make this equivalent to the validity state of the inputs
        // so that changes in validity state cause updates to the UI (see `ProvidedFilter.refresh`).
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: { isInvalid: boolean }, stateB?: { isInvalid: boolean }): boolean {
        // For DateFilter, the state is just a boolean of whether or not any inputs are invalid.
        // As such, `undefined` should be identical to `false`
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    protected override setElementValue(
        element: GridInputTextField | GridInputNumberField,
        value: number | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const params = this.params;
        const numberFormatter = params.numberFormatter;
        let valueToSet: string | number | null = value;
        if (!fromFloatingFilter && numberFormatter) {
            const formatted = numberFormatter(value ?? null);
            // Shown only where it reads back as the same number: nothing else can recover what the user sees.
            if (
                value == null ||
                readsBackAsSameNumber(formatted, value, !!this.allowedCharPattern, params.numberParser)
            ) {
                valueToSet = formatted;
            } else {
                this.beans.log.warn(326, { colId: params.column.getColId() });
            }
        }
        super.setElementValue(element, valueToSet as any);
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected createEValue(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createInputElement('from');
        const to = this.createInputElement('to');
        this.eValuesFrom.push(from);
        this.eValuesTo.push(to);
        eCondition.appendChild(from.getGui());
        eCondition.appendChild(to.getGui());
        this.attachRangeValidationListeners(from, to);

        return eCondition;
    }

    private createInputElement(fromTo: string): GridInputTextField | GridInputNumberField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField | GridInputNumberField>(
            allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputNumberField()
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        return eValue;
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: (GridInputTextField | GridInputNumberField)[]) =>
            this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected getValues(position: number): Tuple<number> {
        const result: Tuple<number> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(processNumberFilterValue(stringToFloat(this.params.numberParser, element.getValue())));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
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

    protected getInputs(position: number): Tuple<GridInputTextField | GridInputNumberField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override isInputInvalid(element: GridInputTextField | GridInputNumberField): boolean {
        return !element.getInputElement().validity.valid;
    }

    protected override canApply(_model: NumberFilterModel | ICombinedSimpleModel<NumberFilterModel> | null): boolean {
        return !this.hasInvalidInputs();
    }
}

function getNormalisedValue(
    numberParser: INumberFilterParams['numberParser'],
    input: GridInputTextField | GridInputNumberField
): number | null {
    return processNumberFilterValue(stringToFloat(numberParser, input.getValue(true)));
}

function getValidityMessageKey(
    fromValue: number | null,
    toValue: number | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}
