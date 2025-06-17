import type { AgColumn } from '../../../entities/agColumn';
import type { SharedFilterParams } from '../../../interfaces/iFilter';
import { _dateToFormattedString, _parseDateTimeFromString } from '../../../utils/date';
import type { OptionsFactory } from '../optionsFactory';
import { SCALAR_FILTER_TYPE_KEYS, SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

export class DateFilterModelFormatter extends SimpleFilterModelFormatter<
    IDateFilterParams,
    typeof SCALAR_FILTER_TYPE_KEYS,
    Date
> {
    protected readonly filterTypeKeys = SCALAR_FILTER_TYPE_KEYS;
    constructor(optionsFactory: OptionsFactory, filterParams: IDateFilterParams) {
        super(optionsFactory, filterParams, (value) => {
            const { dataTypeSvc, valueSvc } = this.beans;
            const column = (filterParams as SharedFilterParams).column as AgColumn;
            const dateFormatFn = dataTypeSvc?.getDateFormatterFunction(column);
            const dateStringStringValue = dateFormatFn?.(value ?? undefined);
            return valueSvc.formatValue(column, null, dateStringStringValue);
        });
    }

    protected conditionToString(
        condition: DateFilterModel,
        forToolPanel: boolean,
        isRange: boolean,
        customDisplayKey: string | undefined,
        customDisplayName: string | undefined
    ): string {
        const { type } = condition;

        const dateFrom = _parseDateTimeFromString(condition.dateFrom);
        const dateTo = _parseDateTimeFromString(condition.dateTo);

        const format = this.filterParams.inRangeFloatingFilterDateFormat;

        const formatDate = forToolPanel
            ? this.formatValue.bind(this)
            : (value: Date) => _dateToFormattedString(value, format);

        const formattedFrom = () => (dateFrom !== null ? formatDate(dateFrom) : 'null');
        const formattedTo = () => (dateTo !== null ? formatDate(dateTo) : 'null');

        if (forToolPanel) {
            const valueForToolPanel = this.conditionForToolPanel(
                type,
                isRange,
                formattedFrom,
                formattedTo,
                customDisplayKey,
                customDisplayName
            );
            if (valueForToolPanel != null) {
                return valueForToolPanel;
            }
        }

        if (isRange) {
            return `${formattedFrom()}-${formattedTo()}`;
        }

        if (dateFrom != null) {
            return formatDate(dateFrom);
        }

        // cater for when the type doesn't need a value
        return `${type}`;
    }
}
