import type { IFilterOptionDef } from '../../../interfaces/iFilter';
import { _dateToFormattedString, _parseDateTimeFromString } from '../../../utils/date';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { DateFilterModel, DateFilterParams } from './iDateFilter';

export class DateFilterModelFormatter extends SimpleFilterModelFormatter {
    constructor(
        private dateFilterParams: DateFilterParams,
        getLocaleTextFunc: () => (key: string, defaultValue: string, variableValues?: string[]) => string,
        optionsFactory: OptionsFactory
    ) {
        super(getLocaleTextFunc, optionsFactory);
    }

    protected conditionToString(condition: DateFilterModel, options?: IFilterOptionDef): string {
        const { type } = condition;
        const { numberOfInputs } = options || {};
        const isRange = type == 'inRange' || numberOfInputs === 2;

        const dateFrom = _parseDateTimeFromString(condition.dateFrom);
        const dateTo = _parseDateTimeFromString(condition.dateTo);

        const format = this.dateFilterParams.inRangeFloatingFilterDateFormat;
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

    public override updateParams(params: { dateFilterParams: DateFilterParams; optionsFactory: OptionsFactory }): void {
        super.updateParams(params);
        this.dateFilterParams = params.dateFilterParams;
    }
}
