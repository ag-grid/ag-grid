import { _isBrowserFirefox, _parseDateTimeFromString, _serialiseDate } from 'ag-stack';

import { _addGridCommonParams } from '../../../gridOptionsUtils';
import type { IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _createElement } from '../../../utils/element';
import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import { _getValidityMessageKey, removeItems } from '../simpleFilterUtils';
import { DateCompWrapper } from './dateCompWrapper';
import type { ValidationReportMode } from './dateCompWrapper';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { mapValuesFromDateFilterModel } from './dateFilterUtils';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

const DEFAULT_MIN_YEAR = 1000;
const DEFAULT_MAX_YEAR = Infinity;

/** temporary type until `DateFilterParams` is updated as breaking change */
type DateFilterDisplayParams = IDateFilterParams &
    FilterDisplayParams<any, any, DateFilterModel | ICombinedSimpleModel<DateFilterModel>>;

export class DateFilter extends SimpleFilter<DateFilterModel, Date, DateCompWrapper, DateFilterDisplayParams> {
    private readonly eConditionPanelsFrom: HTMLElement[] = [];
    private readonly eConditionPanelsTo: HTMLElement[] = [];

    private readonly dateConditionFromComps: DateCompWrapper[] = [];
    private readonly dateConditionToComps: DateCompWrapper[] = [];

    private minValidYear: number = DEFAULT_MIN_YEAR;
    private maxValidYear: number = DEFAULT_MAX_YEAR;
    private minValidDate: Date | null = null;
    private maxValidDate: Date | null = null;

    public readonly filterType = 'date' as const;

    constructor() {
        super('dateFilter', mapValuesFromDateFilterModel, DEFAULT_DATE_FILTER_OPTIONS);
    }

    protected override onGuiAttached(params?: IAfterGuiAttachedParams): void {
        // A read-only filter builds no replacement for a condition a model removed, so there may be none.
        this.dateConditionFromComps[0]?.afterGuiAttached(params);
    }

    protected override commonUpdateSimpleParams(params: DateFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);

        const yearParser = (param: 'minValidYear' | 'maxValidYear', fallback: number) => {
            const value = params[param];
            if (value != null) {
                if (!isNaN(value)) {
                    return value == null ? fallback : Number(value);
                } else {
                    this.beans.log.warn(82, { param });
                }
            }

            return fallback;
        };

        const minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        const maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);
        this.minValidYear = minValidYear;
        this.maxValidYear = maxValidYear;

        if (minValidYear > maxValidYear) {
            this.beans.log.warn(83);
        }

        const { minValidDate, maxValidDate } = params;

        const parsedMinValidDate = minValidDate instanceof Date ? minValidDate : _parseDateTimeFromString(minValidDate);
        this.minValidDate = parsedMinValidDate;

        const parsedMaxValidDate = maxValidDate instanceof Date ? maxValidDate : _parseDateTimeFromString(maxValidDate);
        this.maxValidDate = parsedMaxValidDate;

        if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate > parsedMaxValidDate) {
            this.beans.log.warn(84);
        }
    }

    protected override refreshPositionValidation(position: number, isFrom = false, reattached?: boolean): void {
        // A picker keeps its message across a close, so re-opening is no change for `debounceIfChanged` to find.
        this.refreshInputPairValidation(position, isFrom, reattached ? 'immediate' : 'debounceIfChanged');
    }

    private refreshInputPairValidation(position: number, isFrom: boolean, reportMode: ValidationReportMode): void {
        const [from, to] = this.getInputs(position);
        if (!from || !to) {
            return; // A destroyed picker can still report focus, and the pair it belonged to is gone.
        }

        const fromDate = from.getDate();
        const toDate = to.getDate();
        // An option taking one value has no order an input can be reported as out of.
        const isRange = this.conditionNumberOfInputs(position) >= 2;
        const localeKey = isRange
            ? _getValidityMessageKey(fromDate, toDate, isFrom, this.params.inRangeInclusive)
            : null;
        const message = localeKey ? this.translate(localeKey, [String(isFrom ? toDate : fromDate)]) : '';

        // FF seems to handle cursors/focus sufficiently well for the validation to be left as synchronous.
        // Chrome/Safari, however, need to be debounced, otherwise they will reset the date input cursor when
        // reporting validity.
        // For example, when typing "2000", when we get to "200", that is interpreted as a valid year by Chrome
        // (even though a HTML date should be four digits per the spec), which triggers validation, and the
        // final keystroke of "0" will instead be interpreted as the first keystroke of a new year.
        const effectiveMode: ValidationReportMode = _isBrowserFirefox() ? 'immediate' : reportMode;

        (isFrom ? from : to).setCustomValidity(message, effectiveMode); // Set validity error state for target input
        (isFrom ? to : from).setCustomValidity('', effectiveMode); // Reset validity error state for other input

        if (message.length > 0) {
            this.beans.ariaAnnounce.announceValue(message, 'filterValidation');
        }
    }

    private createDateCompWrapper(element: HTMLElement, fromTo: 'from' | 'to'): DateCompWrapper {
        const {
            beans: { userCompFactory, context, gos },
            params,
        } = this;
        const isFrom = fromTo === 'from';
        // Read per event, never captured: removing a condition from the middle shifts every later one.
        const panels = isFrom ? this.eConditionPanelsFrom : this.eConditionPanelsTo;
        const refreshValidation = (reportMode: ValidationReportMode) =>
            this.refreshInputPairValidation(panels.indexOf(element), isFrom, reportMode);
        return new DateCompWrapper(
            context,
            userCompFactory,
            params.colDef,
            _addGridCommonParams<IDateParams>(gos, {
                onDateChanged: () => {
                    refreshValidation('debounce');
                    this.onUiChanged();
                },
                onDateCleared: () => {
                    refreshValidation('immediate');
                    this.onUiCleared();
                },
                onFocusIn: () => refreshValidation('debounceIfChanged'),
                filterParams: params as any,
                location: 'filter',
            }),
            element
        );
    }

    /** Not beans, and replaced as conditions come and go, so nothing else tears them down. */
    public override destroy(): void {
        this.removeDateComps(this.dateConditionFromComps, 0);
        this.removeDateComps(this.dateConditionToComps, 0);
        super.destroy();
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

    protected override setElementValue(element: DateCompWrapper, value: Date | null): void {
        element.setDate(value);
        if (!value) {
            element.setCustomValidity('');
        }
    }

    protected override setElementDisplayed(element: DateCompWrapper, displayed: boolean): void {
        element.setDisplayed(displayed);
    }

    protected override setElementDisabled(element: DateCompWrapper, disabled: boolean): void {
        element.setDisabled(disabled);
    }

    protected createEValue(): HTMLElement {
        const eCondition = _createElement({ tag: 'div', cls: 'ag-filter-body' });

        this.createFromToElement(eCondition, this.eConditionPanelsFrom, this.dateConditionFromComps, 'from');
        this.createFromToElement(eCondition, this.eConditionPanelsTo, this.dateConditionToComps, 'to');

        return eCondition;
    }

    private createFromToElement(
        eCondition: HTMLElement,
        eConditionPanels: HTMLElement[],
        dateConditionComps: DateCompWrapper[],
        fromTo: 'from' | 'to'
    ): void {
        const eConditionPanel = _createElement({ tag: 'div', cls: `ag-filter-${fromTo} ag-filter-date-${fromTo}` });
        eConditionPanels.push(eConditionPanel);
        eCondition.appendChild(eConditionPanel);
        dateConditionComps.push(this.createDateCompWrapper(eConditionPanel, fromTo));
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        this.removeDateComps(this.dateConditionFromComps, startPosition, deleteCount);
        this.removeDateComps(this.dateConditionToComps, startPosition, deleteCount);
        removeItems(this.eConditionPanelsFrom, startPosition, deleteCount);
        removeItems(this.eConditionPanelsTo, startPosition, deleteCount);
    }

    protected removeDateComps(components: DateCompWrapper[], startPosition: number, deleteCount?: number): void {
        const removedComponents = removeItems(components, startPosition, deleteCount);
        for (const comp of removedComponents) {
            comp.destroy();
        }
    }

    private isValidDateValue(value: Date | null): boolean {
        if (value === null) {
            return false;
        }

        const { minValidDate, maxValidDate, minValidYear, maxValidYear } = this;

        if (minValidDate) {
            if (value < minValidDate) {
                return false;
            }
        } else if (value.getUTCFullYear() < minValidYear) {
            return false;
        }

        if (maxValidDate) {
            if (value > maxValidDate) {
                return false;
            }
        } else if (value.getUTCFullYear() > maxValidYear) {
            return false;
        }

        return true;
    }

    /** No validity state means nothing has rejected the value, so it is fine. */
    protected override isInputInvalid(element: DateCompWrapper): boolean {
        return !(element.getValidity()?.valid ?? true);
    }

    /** A date is read only once whole, so a part-typed one is not a value the picker has rejected. */
    protected override isInputValueSettled(element: DateCompWrapper): boolean {
        return element.getDate() != null;
    }

    protected override isConditionUiComplete(position: number): boolean {
        if (!super.isConditionUiComplete(position)) {
            return false;
        }

        let valid = true;
        this.forEachPositionInput(position, (element, index, _pos, numberOfInputs) => {
            if (!valid || index >= numberOfInputs) {
                return;
            }
            valid &&= this.isValidDateValue(element.getDate());
        });

        return valid;
    }

    protected areSimpleModelsEqual(aSimple: DateFilterModel, bSimple: DateFilterModel): boolean {
        return (
            aSimple.dateFrom === bSimple.dateFrom && aSimple.dateTo === bSimple.dateTo && aSimple.type === bSimple.type
        );
    }

    protected createCondition(position: number): DateFilterModel {
        const type = this.getConditionType(position);
        const model: Partial<DateFilterModel> = {};
        const { params, filterType, beans } = this;
        const dataTypeSvc = beans.dataTypeSvc;
        const values = this.getValues(position);
        const includeDateTime =
            params.includeTime ?? dataTypeSvc?.getDateIncludesTimeFlag(params.colDef.cellDataType) ?? true;

        const separator = params.useIsoSeparator ? 'T' : ' ';
        if (values.length > 0) {
            model.dateFrom = _serialiseDate(values[0], includeDateTime, separator);
        }
        if (values.length > 1) {
            model.dateTo = _serialiseDate(values[1], includeDateTime, separator);
        }

        return {
            dateFrom: null,
            dateTo: null,
            filterType,
            type,
            ...model,
        };
    }

    protected override resetPlaceholder(): void {
        const globalTranslate = this.getLocaleTextFunc();
        const placeholder = this.translate('dateFormatOoo');
        const ariaLabel = globalTranslate('ariaFilterValue', 'Filter Value');

        this.forEachInput((element) => {
            element.setInputPlaceholder(placeholder);
            element.setInputAriaLabel(ariaLabel);
        });
    }

    protected getInputs(position: number): Tuple<DateCompWrapper> {
        const { dateConditionFromComps, dateConditionToComps } = this;
        // Bounded below too: the position is looked up with `indexOf`, which reports a gone comp as -1.
        if (position < 0 || position >= dateConditionFromComps.length) {
            return [null, null];
        }
        return [dateConditionFromComps[position], dateConditionToComps[position]];
    }

    protected getValues(position: number): Tuple<Date> {
        const result: Tuple<Date> = [];
        this.forEachPositionInput(position, (element, index, _elPosition, numberOfInputs) => {
            if (index < numberOfInputs) {
                result.push(element.getDate());
            }
        });

        return result;
    }

    protected override translate(key: FilterLocaleTextKey, variableValues?: string[]): string {
        let normalisedKey = key;
        if (key === 'lessThan') {
            normalisedKey = 'before';
        } else if (key === 'greaterThan') {
            normalisedKey = 'after';
        }
        return super.translate(normalisedKey, variableValues);
    }
}
