import type { FilterLocaleTextKey } from '../../filterLocaleText';
import type { ISimpleFilterModelType } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getScalarFilterTypeKey } from '../scalarFilterUtils';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export class NumberFilterModelFormatter extends SimpleFilterModelFormatter<INumberFilterParams, number> {
    constructor(optionsFactory: OptionsFactory, filterParams: INumberFilterParams) {
        super(optionsFactory, filterParams, filterParams.numberFormatter);
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

    protected override getTypeKey(type: ISimpleFilterModelType | null | undefined): FilterLocaleTextKey | null {
        return getScalarFilterTypeKey(type);
    }
}
