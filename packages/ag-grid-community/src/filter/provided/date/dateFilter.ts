import { _addGridCommonParams } from '../../../gridOptionsUtils';
import type { IDateParams } from '../../../interfaces/dateComponent';
import type { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
import type { FilterDisplayParams } from '../../../interfaces/iFilter';
import { _parseDateTimeFromString, _serialiseDate } from '../../../utils/date';
import { _createElement } from '../../../utils/dom';
import { _warn } from '../../../validation/logging';
import type { FILTER_LOCALE_TEXT } from '../../filterLocaleText';
import type { ICombinedSimpleModel, Tuple } from '../iSimpleFilter';
import { SimpleFilter } from '../simpleFilter';
import { removeItems } from '../simpleFilterUtils';
import { DateCompWrapper } from './dateCompWrapper';
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

    public override afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        super.afterGuiAttached(params);

        this.dateConditionFromComps[0].afterGuiAttached(params);
    }

    protected override commonUpdateSimpleParams(params: DateFilterDisplayParams): void {
        super.commonUpdateSimpleParams(params);

        const yearParser = (param: 'minValidYear' | 'maxValidYear', fallback: number) => {
            const value = params[param];
            if (value != null) {
                if (!isNaN(value)) {
                    return value == null ? fallback : Number(value);
                } else {
                    _warn(82, { param });
                }
            }

            return fallback;
        };

        const minValidYear = yearParser('minValidYear', DEFAULT_MIN_YEAR);
        const maxValidYear = yearParser('maxValidYear', DEFAULT_MAX_YEAR);
        this.minValidYear = minValidYear;
        this.maxValidYear = maxValidYear;

        if (minValidYear > maxValidYear) {
            _warn(83);
        }

        const { minValidDate, maxValidDate } = params;

        const parsedMinValidDate = minValidDate instanceof Date ? minValidDate : _parseDateTimeFromString(minValidDate);
        this.minValidDate = parsedMinValidDate;

        const parsedMaxValidDate = maxValidDate instanceof Date ? maxValidDate : _parseDateTimeFromString(maxValidDate);
        this.maxValidDate = parsedMaxValidDate;

        if (parsedMinValidDate && parsedMaxValidDate && parsedMinValidDate > parsedMaxValidDate) {
            _warn(84);
        }
    }

    createDateCompWrapper(element: HTMLElement): DateCompWrapper {
        const {
            beans: { userCompFactory, context, gos },
            params,
        } = this;
        const dateCompWrapper = new DateCompWrapper(
            context,
            userCompFactory,
            params.colDef,
            _addGridCommonParams<IDateParams>(gos, {
                onDateChanged: () => this.onUiChanged(),
                filterParams: params as any,
                location: 'filter',
            }),
            element
        );
        this.addDestroyFunc(() => dateCompWrapper.destroy());
        return dateCompWrapper;
    }

    protected override setElementValue(element: DateCompWrapper, value: Date | null): void {
        element.setDate(value);
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
        fromTo: string
    ): void {
        const eConditionPanel = _createElement({ tag: 'div', cls: `ag-filter-${fromTo} ag-filter-date-${fromTo}` });
        eConditionPanels.push(eConditionPanel);
        eCondition.appendChild(eConditionPanel);
        dateConditionComps.push(this.createDateCompWrapper(eConditionPanel));
    }

    protected removeEValues(startPosition: number, deleteCount?: number): void {
        this.removeDateComps(this.dateConditionFromComps, startPosition, deleteCount);
        this.removeDateComps(this.dateConditionToComps, startPosition, deleteCount);
        removeItems(this.eConditionPanelsFrom, startPosition, deleteCount);
        removeItems(this.eConditionPanelsTo, startPosition, deleteCount);
    }

    protected removeDateComps(components: DateCompWrapper[], startPosition: number, deleteCount?: number): void {
        const removedComponents = removeItems(components, startPosition, deleteCount);
        removedComponents.forEach((comp) => comp.destroy());
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
        } else {
            if (value.getUTCFullYear() < minValidYear) {
                return false;
            }
        }

        if (maxValidDate) {
            if (value > maxValidDate) {
                return false;
            }
        } else {
            if (value.getUTCFullYear() > maxValidYear) {
                return false;
            }
        }

        return true;
    }

    protected override isConditionUiComplete(position: number): boolean {
        if (!super.isConditionUiComplete(position)) {
            return false;
        }

        let valid = true;
        this.forEachInput((element, index, elPosition, numberOfInputs) => {
            if (elPosition !== position || !valid || index >= numberOfInputs) {
                return;
            }
            valid = valid && this.isValidDateValue(element.getDate());
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

        const values = this.getValues(position);
        if (values.length > 0) {
            model.dateFrom = _serialiseDate(values[0]);
        }
        if (values.length > 1) {
            model.dateTo = _serialiseDate(values[1]);
        }

        return {
            dateFrom: null,
            dateTo: null,
            filterType: this.filterType,
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
        if (position >= dateConditionFromComps.length) {
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

    protected override translate(key: keyof typeof FILTER_LOCALE_TEXT): string {
        if (key === 'lessThan') {
            return super.translate('before');
        }
        if (key === 'greaterThan') {
            return super.translate('after');
        }
        return super.translate(key);
    }
}
