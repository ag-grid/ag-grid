import { _parseDateTimeFromString } from '../../../utils/date';
import type { Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { DateFilterModel } from './iDateFilter';

export function mapValuesFromDateFilterModel(
    filterModel: DateFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<Date> {
    // unlike the other filters, we do two things here:
    // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
    //    are in different locations in Date and Number filter models)
    // 2) convert the type (because Date filter uses Dates, however model is 'string')
    //
    // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
    //       a date from the UI, it will have timezone info in it. This is lost when creating
    //       the model. When we recreate the date again here, it's without a timezone.
    const { dateFrom, dateTo, type } = filterModel || {};
    return [
        (dateFrom && _parseDateTimeFromString(dateFrom)) || null,
        (dateTo && _parseDateTimeFromString(dateTo)) || null,
    ].slice(0, getNumberOfInputs(type, optionsFactory));
}
