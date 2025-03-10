import type { Comparator } from '../iScalarFilter';
import { ScalarFilterEvaluator } from '../scalarFilterEvaluator';
import { DateFilterHelper } from './dateFilterHelper';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
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

export class DateFilterEvaluator extends ScalarFilterEvaluator<DateFilterModel, Date, IDateFilterParams> {
    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;

    constructor() {
        super(new DateFilterHelper());
    }

    protected override comparator(): Comparator<Date> {
        return this.params.filterParams.comparator ?? defaultDateComparator;
    }

    protected override isValid(value: Date): boolean {
        const isValidDate = this.params.filterParams.isValidDate;
        return !isValidDate || isValidDate(value);
    }
}
