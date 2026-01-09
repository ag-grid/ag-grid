import type { Comparator } from '../iScalarFilter';
import type { ISimpleFilterModelPresetType, Tuple } from '../iSimpleFilter';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import { mapValuesFromDateFilterModel, presetDateFilterTypeRelativeFromToMap } from './dateFilterUtils';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

function defaultDateComparator(filterDate: Date, cellValue: any): number {
    // The default comparator assumes that the cellValue is a date
    const cellAsDate = cellValue as Date;

    if (cellAsDate < filterDate) {
        return -1;
    }
    if (cellAsDate > filterDate) {
        return 1;
    }

    return 0;
}

export class DateFilterHandler extends ScalarFilterHandler<DateFilterModel, Date, IDateFilterParams> {
    public readonly filterType = 'date' as const;
    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;
    /**
     * This is used to prevent desync when user scrolls in SSRM, and to materialise time into a grid state
     */
    public readonly beanCreationTime = new Date();

    constructor() {
        super(mapValuesFromDateFilterModel, DEFAULT_DATE_FILTER_OPTIONS);
    }

    protected override comparator(): Comparator<Date> {
        return this.params.filterParams.comparator ?? defaultDateComparator;
    }

    protected override isValid(value: Date): boolean {
        const isValidDate = this.params.filterParams.isValidDate;
        return !isValidDate || isValidDate(value);
    }

    protected override evaluateNonNullValue(
        values: Tuple<Date>,
        cellValue: Date,
        filterModel: DateFilterModel
    ): boolean {
        const type = filterModel.type;
        const comparator = this.comparator();

        if (!this.isValid(cellValue)) {
            return type === 'notEqual' || type === 'notBlank';
        }
        const presetDateRangeFn = presetDateFilterTypeRelativeFromToMap[type as ISimpleFilterModelPresetType];
        if (presetDateRangeFn) {
            const { from, to } = presetDateRangeFn(new Date(this.beanCreationTime), new Date(this.beanCreationTime));
            return comparator(from, cellValue) >= 0 && comparator(to, cellValue) < 0;
        }

        return super.evaluateNonNullValue(values, cellValue, filterModel);
    }
}
