import { AgInputTextField } from '../../../agWidgets/agInputTextField';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { GridInputTextField } from '../../../widgets/gridWidgetTypes';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import { DEFAULT_BIGINT_FILTER_OPTIONS } from './bigIntFilterConstants';
import { getAllowedCharPattern, mapValuesFromBigIntFilterModel, stringToBigInt } from './bigIntFilterUtils';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

/** temporary type until `BigIntFilterParams` is updated as breaking change */
type BigIntFilterDisplayParams = IBigIntFilterParams &
    FilterDisplayParams<any, any, BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel>>;

export class BigIntFilter extends SimpleFilter<
    BigIntFilterModel,
    bigint,
    GridInputTextField,
    BigIntFilterDisplayParams
> {
    private readonly eValuesFrom: GridInputTextField[] = [];
    private readonly eValuesTo: GridInputTextField[] = [];
    /** Read once when an input is built, so a `colDef` refresh that changes it has to rebuild them. */
    private allowedCharPattern: string | null;
    /** The parameters the mounted inputs were filled through; their text is only readable through these. */
    private renderedWith: BigIntFilterDisplayParams | undefined;

    public readonly filterType = 'bigint' as const;

    constructor() {
        super('bigintFilter', mapValuesFromBigIntFilterModel, DEFAULT_BIGINT_FILTER_OPTIONS);
    }

    protected override defaultDebounceMs = 500;

    public override afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.refreshInputValidation();
    }

    protected override refreshPositionValidation(position: number, isFrom = false): void {
        const from = this.eValuesFrom[position];
        const to = this.eValuesTo[position];
        const { bigintParser } = this.params;
        const fromValue = this.getParsedValue(from, bigintParser);
        const toValue = this.getParsedValue(to, bigintParser);
        const fromInvalid = this.isInvalidValue(from, fromValue);
        const toInvalid = this.isInvalidValue(to, toValue);

        const target = isFrom ? from : to;
        const other = isFrom ? to : from;
        const otherInvalid = isFrom ? toInvalid : fromInvalid;

        // A value the parser rejected is reported as such; only a readable pair can be reported as out of order.
        let validityMessage = '';
        if (isFrom ? fromInvalid : toInvalid) {
            validityMessage = this.getLocaleTextFunc()('invalidBigInt', 'Invalid BigInt');
        } else if (!fromInvalid && !toInvalid && this.isRangeCondition(position)) {
            const localeKey = getValidityMessageKey(fromValue, toValue, isFrom);
            validityMessage = localeKey ? this.translate(localeKey, [String(other.getValue())]) : '';
        }

        target.setCustomValidity(validityMessage);
        if (!otherInvalid) {
            other.setCustomValidity('');
        }
        if (validityMessage.length > 0) {
            this.beans.ariaAnnounce.announceValue(validityMessage, 'dateFilter');
        }
    }

    protected override getState(): { isInvalid: boolean } {
        return { isInvalid: this.hasInvalidInputs() };
    }

    protected override areStatesEqual(stateA?: { isInvalid: boolean }, stateB?: { isInvalid: boolean }): boolean {
        return (stateA?.isInvalid ?? false) === (stateB?.isInvalid ?? false);
    }

    protected override setElementValue(
        element: GridInputTextField,
        value: bigint | null,
        fromFloatingFilter?: boolean
    ): void {
        // values from floating filter are directly from the input, not from the model
        const bigintFormatter = this.params.bigintFormatter;
        const valueToSet = !fromFloatingFilter && bigintFormatter ? bigintFormatter(value ?? null) : value;
        super.setElementValue(element, valueToSet as any, fromFloatingFilter);
        this.trackRenderedValue(element, value, fromFloatingFilter);
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected override commonUpdateSimpleParams(params: BigIntFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);
        this.refreshInputElements(params);
    }

    /** An input's element type is fixed when it is built, so a `colDef` refresh that changes it rebuilds them. */
    private refreshInputElements(params: BigIntFilterDisplayParams): void {
        const previous = this.renderedWith;
        this.renderedWith = params;
        const allowedCharPattern = getAllowedCharPattern(params);
        const rebuild = allowedCharPattern !== this.allowedCharPattern;
        this.allowedCharPattern = allowedCharPattern;
        // What an input shows is rendered through these, so its text stops being readable when they change.
        const rerender =
            rebuild ||
            params.bigintParser !== previous?.bigintParser ||
            params.bigintFormatter !== previous?.bigintFormatter;
        const { eValuesFrom, eValuesTo } = this;
        const numConditions = eValuesFrom.length;
        if (!rerender || !numConditions) {
            return;
        }
        const previousParser = previous?.bigintParser;
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
        eValues: GridInputTextField[],
        position: number,
        fromTo: string,
        rebuild: boolean,
        previousParser: IBigIntFilterParams['bigintParser']
    ): void {
        const previous = eValues[position];
        const text = previous.getValue();
        // What the filter wrote is read back from what it was rendered with; only the user's own typing is parsed.
        const rendered = this.getRenderedValue(previous);
        const value = rendered ? rendered.value : stringToBigInt(previousParser, text);
        // Text no parser reads is not a value to render again, it is what the user is still typing.
        const isMidEdit = value == null && text != null && text !== '';
        let element = previous;
        if (rebuild) {
            element = this.createInputElement(fromTo);
            previous.getGui().replaceWith(element.getGui());
            this.forgetRenderedValue(previous);
            this.destroyBean(previous);
            eValues[position] = element;
        }
        if (isMidEdit) {
            element.setValue(text, true);
        } else {
            this.setElementValue(element, value);
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

    private createInputElement(fromTo: string): GridInputTextField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField>(
            new AgInputTextField(allowedCharPattern ? { allowedCharPattern } : undefined)
        );
        eValue.addCss(`ag-filter-${fromTo}`);
        eValue.addCss('ag-filter-filter');
        return eValue;
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        const removeComps = (eGui: GridInputTextField[]) => this.removeComponents(eGui, startPosition, deleteCount);

        removeComps(this.eValuesFrom);
        removeComps(this.eValuesTo);
    }

    protected getValues(position: number): Tuple<bigint> {
        const { bigintParser } = this.params;
        const result: Tuple<bigint> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(this.getParsedValue(element, bigintParser));
            }
        });

        return result;
    }

    protected areSimpleModelsEqual(aSimple: BigIntFilterModel, bSimple: BigIntFilterModel): boolean {
        return (
            aSimple.filter === bSimple.filter && aSimple.filterTo === bSimple.filterTo && aSimple.type === bSimple.type
        );
    }

    protected createCondition(position: number): BigIntFilterModel {
        const type = this.getConditionType(position);
        const model: BigIntFilterModel = {
            filterType: this.filterType,
            type,
        };

        const values = this.getValues(position);
        if (values.length > 0) {
            model.filter = String(values[0]);
        }
        if (values.length > 1) {
            model.filterTo = String(values[1]);
        }

        return model;
    }

    protected override getInputs(position: number): Tuple<GridInputTextField> {
        const { eValuesFrom, eValuesTo } = this;
        if (position >= eValuesFrom.length) {
            return [null, null];
        }
        return [eValuesFrom[position], eValuesTo[position]];
    }

    protected override isInputInvalid(element: GridInputTextField): boolean {
        return !element.getInputElement().validity.valid;
    }

    protected override canApply(_model: BigIntFilterModel | ICombinedSimpleModel<BigIntFilterModel> | null): boolean {
        return !this.hasInvalidInputs();
    }

    /** The value an input holds: the one it was rendered with, until the user makes the text their own. */
    private getParsedValue(
        element: GridInputTextField,
        bigintParser: IBigIntFilterParams['bigintParser']
    ): bigint | null {
        const rendered = this.getRenderedValue(element);
        if (rendered) {
            return rendered.value;
        }
        return stringToBigInt(bigintParser, element.getValue());
    }

    private isInvalidValue(element: GridInputTextField, parsedValue: bigint | null): boolean {
        const rawValue = element.getValue();
        return rawValue != null && String(rawValue).trim() !== '' && parsedValue === null;
    }
}

function getValidityMessageKey(
    fromValue: bigint | null,
    toValue: bigint | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}
