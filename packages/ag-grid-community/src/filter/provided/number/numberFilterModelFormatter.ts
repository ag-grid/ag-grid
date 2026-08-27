import { SCALAR_FILTER_TYPE_KEYS, SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import { _bindFilterCallback } from '../simpleFilterUtils';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export class NumberFilterModelFormatter extends SimpleFilterModelFormatter<
    INumberFilterParams,
    typeof SCALAR_FILTER_TYPE_KEYS,
    number
> {
    protected readonly filterTypeKeys = SCALAR_FILTER_TYPE_KEYS;

    protected override getValueFormatter(): ((value: number | null) => string | null) | undefined {
        return _bindFilterCallback(this.filterParams.numberFormatter, this.gos, this.filterConfig.column);
    }

    protected conditionToString(
        condition: NumberFilterModel,
        forToolPanel: boolean,
        isRange: boolean,
        customDisplayKey: string | undefined,
        customDisplayName: string | undefined
    ): string {
        const { filter, filterTo, type } = condition;

        const formatValue = this.formatValue.bind(this);

        if (forToolPanel) {
            const valueForToolPanel = this.conditionForToolPanel(
                type,
                isRange,
                () => formatValue(filter),
                () => formatValue(filterTo),
                customDisplayKey,
                customDisplayName
            );
            if (valueForToolPanel != null) {
                return valueForToolPanel;
            }
        }

        if (isRange) {
            return `${formatValue(filter)}-${formatValue(filterTo)}`;
        }

        // cater for when the type doesn't need a value
        if (filter != null) {
            return formatValue(filter);
        }

        return `${type}`;
    }
}
