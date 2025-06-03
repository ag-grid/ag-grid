import { _dateToFormattedString, _parseDateTimeFromString } from '../../../utils/date';
import type { IFilterOptionDef } from '../iSimpleFilter';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

export class DateFilterModelFormatter extends SimpleFilterModelFormatter<IDateFilterParams> {
    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string {
        const { type } = condition;
        const { numberOfInputs } = options || {};
        const isRange = type == 'inRange' || numberOfInputs === 2;

        const dateFrom = _parseDateTimeFromString(condition.dateFrom);
        const dateTo = _parseDateTimeFromString(condition.dateTo);

        const format = this.filterParams.inRangeFloatingFilterDateFormat;
        if (isRange) {
            const formattedFrom = dateFrom !== null ? _dateToFormattedString(dateFrom, format) : 'null';
            const formattedTo = dateTo !== null ? _dateToFormattedString(dateTo, format) : 'null';
            return `${formattedFrom}-${formattedTo}`;
        }

        if (dateFrom != null) {
            return _dateToFormattedString(dateFrom, format);
        }

        // cater for when the type doesn't need a value
        return `${type}`;
    }
}
