import type { Comparator } from '../iScalarFilter';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import { mapValuesFromDateFilterModel } from './dateFilterUtils';
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
    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;

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
}
