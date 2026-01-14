import type { OptionsFactory } from '../optionsFactory';
import { SCALAR_FILTER_TYPE_KEYS, SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { BigIntFilterModel, IBigIntFilterParams } from './iBigIntFilter';

export class BigIntFilterModelFormatter extends SimpleFilterModelFormatter<
    IBigIntFilterParams,
    typeof SCALAR_FILTER_TYPE_KEYS,
    bigint
> {
    protected readonly filterTypeKeys = SCALAR_FILTER_TYPE_KEYS;

    constructor(optionsFactory: OptionsFactory, filterParams: IBigIntFilterParams) {
        super(optionsFactory, filterParams, filterParams.bigintFormatter);
    }

    protected conditionToString(
        condition: BigIntFilterModel,
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

        if (filter != null) {
            return formatValue(filter);
        }

        return `${type}`;
    }
}
