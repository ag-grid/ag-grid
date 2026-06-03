import { _parseBigIntOrNull } from 'ag-stack';

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
        const format = this.formatValue.bind(this);

        const parsedFrom = _parseBigIntOrNull(filter);
        const parsedTo = _parseBigIntOrNull(filterTo);
        if (forToolPanel) {
            const valueForToolPanel = this.conditionForToolPanel(
                type,
                isRange,
                () => format(parsedFrom),
                () => format(parsedTo),
                customDisplayKey,
                customDisplayName
            );
            if (valueForToolPanel != null) {
                return valueForToolPanel;
            }
        }

        if (isRange) {
            return `${format(parsedFrom)}-${format(parsedTo)}`;
        }

        if (filter != null) {
            return format(parsedFrom);
        }

        return `${type}`;
    }
}
