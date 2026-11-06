import type { BeanCollection } from '../../../context/context';
import { _getDateTimeParser, _usesUtcDateTime } from '../../../gridOptionsUtils';
import type { SharedFilterParams } from '../../../interfaces/iFilter';
import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

export function dateFilterIncludesTime({ dataTypeSvc }: BeanCollection, filterParams: IDateFilterParams): boolean {
    return (
        filterParams.includeTime ??
        dataTypeSvc?.getDateIncludesTimeFlag((filterParams as SharedFilterParams).colDef.cellDataType) ??
        true
    );
}

/** Whether this filter's model holds UTC instants rather than local datetimes. */
export function usesUtcDateFilterModel(beans: BeanCollection, filterParams: IDateFilterParams): boolean {
    return _usesUtcDateTime(beans.gos, dateFilterIncludesTime(beans, filterParams));
}

export function parseDateFilterModelValue(
    beans: BeanCollection,
    filterParams: IDateFilterParams,
    value: string | null | undefined,
    skipValidation?: boolean
): Date | null {
    return _getDateTimeParser(beans.gos, dateFilterIncludesTime(beans, filterParams))(value, undefined, skipValidation);
}

export function mapValuesFromDateFilterModel(
    filterModel: DateFilterModel | null,
    optionsFactory: OptionsFactory,
    beans: BeanCollection,
    filterParams: IDateFilterParams
): Tuple<Date> {
    // unlike the other filters, we do two things here:
    // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
    //    are in different locations in Date and Number filter models)
    // 2) convert the type (because Date filter uses Dates, however model is 'string')
    const { dateFrom, dateTo, type } = filterModel ?? {};
    return [
        (dateFrom && parseDateFilterModelValue(beans, filterParams, dateFrom, true)) || null,
        (dateTo && parseDateFilterModelValue(beans, filterParams, dateTo, true)) || null,
    ].slice(0, getNumberOfInputs(type, optionsFactory));
}
