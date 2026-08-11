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
    /** What each input was last rendered with, keyed weakly so a replaced element takes its entry with it. */
    private readonly rendered = new WeakMap<GridInputTextField, { text: string; value: bigint | null }>();

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
        // What the filter wrote is not something the user typed, so it is never read back through the parser.
        // A floating filter passes the text the user typed there, which is read back like any other typing.
        if (fromFloatingFilter) {
            this.rendered.delete(element);
        } else {
            this.rendered.set(element, { text: element.getInputElement().value, value });
        }
        if (valueToSet === null) {
            element.setCustomValidity('');
        }
    }

    protected override commonUpdateSimpleParams(params: BigIntFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);
        this.refreshInputElements(params);
    }

    /** Mirrors the Number Filter, and the BigInt floating filter, which already rebuild on this change. */
    private refreshInputElements(params: BigIntFilterDisplayParams): void {
        const allowedCharPattern = getAllowedCharPattern(params);
        if (allowedCharPattern === this.allowedCharPattern) {
            return;
        }
        this.allowedCharPattern = allowedCharPattern;
        const { eValuesFrom, eValuesTo } = this;
        const numConditions = eValuesFrom.length;
        if (!numConditions) {
            return;
        }
        for (let position = 0; position < numConditions; ++position) {
            this.rebuildInputElement(eValuesFrom, position, 'from');
            this.rebuildInputElement(eValuesTo, position, 'to');
            this.attachRebuiltInputListeners(eValuesFrom[position], eValuesTo[position]);
        }
        this.updateUiVisibility(); // the replacements start visible and enabled, whatever the condition is
        this.refreshInputValidation();
    }

    /** The text is the canonical decimal string either way, so it carries across the rebuild unchanged. */
    private rebuildInputElement(eValues: GridInputTextField[], position: number, fromTo: string): void {
        const previous = eValues[position];
        const eValue = this.createInputElement(fromTo);
        eValue.setValue(previous.getValue(), true);
        previous.getGui().replaceWith(eValue.getGui());
        this.destroyBean(previous);
        eValues[position] = eValue;
    }

    protected createEValue(): HTMLElement {
        const { eValuesFrom, eValuesTo } = this;

        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body', role: 'presentation' });

        const from = this.createFromToElement(eCondition, eValuesFrom, 'from');
        const to = this.createFromToElement(eCondition, eValuesTo, 'to');

        this.attachRangeValidationListeners(from, to);

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eValues: GridInputTextField[],
        fromTo: string
    ): GridInputTextField {
        const eValue = this.createInputElement(fromTo);
        eValues.push(eValue);
        eCondition.appendChild(eValue.getGui());
        return eValue;
    }

    private createInputElement(fromTo: string): GridInputTextField {
        const allowedCharPattern = this.allowedCharPattern;
        const eValue = this.createManagedBean<GridInputTextField>(
            allowedCharPattern ? new AgInputTextField({ allowedCharPattern }) : new AgInputTextField()
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
        const rendered = this.rendered.get(element);
        if (rendered?.text === element.getInputElement().value) {
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
