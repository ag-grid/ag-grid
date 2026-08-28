import { _getOwn } from 'ag-stack';

import type { Column } from '../../../interfaces/iColumn';
import type { Comparator } from '../iScalarFilter';
import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import { mapValuesFromDateFilterModel } from './dateFilterUtils';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';
import { RelativeDateRangeCache, presetDateFilterTypeRelativeFromToMap } from './relativeDateRanges';

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
    private readonly rangeCache = new RelativeDateRangeCache();

    constructor() {
        super(mapValuesFromDateFilterModel, DEFAULT_DATE_FILTER_OPTIONS);
    }

    protected createModelFormatter(
        optionsFactory: OptionsFactory,
        filterParams: IDateFilterParams,
        column: Column
    ): DateFilterModelFormatter {
        return new DateFilterModelFormatter(optionsFactory, filterParams, column);
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

        if (!this.isValid(cellValue)) {
            return type === 'notEqual' || type === 'notBlank';
        }
        // A filter model's `type` is any string at all, hence the own-property lookup.
        const presetDateRangeFn = type == null ? undefined : _getOwn(presetDateFilterTypeRelativeFromToMap, type);
        if (presetDateRangeFn) {
            // user selected a preset, calculate what they mean
            const { fromTime, toTime } = this.rangeCache.getRange(type!, presetDateRangeFn);
            const userComparator = this.params.filterParams.comparator;
            if (userComparator) {
                // Dates of its own, built for each of the rows this runs on: a user comparator is free to
                // keep or to normalise whatever it is handed.
                return (
                    userComparator(new Date(fromTime), cellValue) >= 0 &&
                    userComparator(new Date(toTime), cellValue) < 0
                );
            }
            // Half-open, as `defaultDateComparator` makes it, and compared as times since nothing is handed a date.
            const cellTime = +cellValue;
            return cellTime >= fromTime && cellTime < toTime;
        }

        return super.evaluateNonNullValue(values, cellValue, filterModel);
    }
}
