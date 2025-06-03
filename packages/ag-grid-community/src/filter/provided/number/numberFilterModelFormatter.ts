import type { LocaleTextFunc } from '../../../misc/locale/localeUtils';
import type { IFilterOptionDef } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { INumberFilterParams, NumberFilterModel } from './iNumberFilter';

export class NumberFilterModelFormatter extends SimpleFilterModelFormatter<INumberFilterParams, number> {
    constructor(
        getLocaleTextFunc: () => LocaleTextFunc,
        optionsFactory: OptionsFactory,
        filterParams: INumberFilterParams
    ) {
        super(getLocaleTextFunc, optionsFactory, filterParams, filterParams.numberFormatter);
    }

    protected conditionToString(condition: NumberFilterModel, options?: IFilterOptionDef): string {
        const { numberOfInputs } = options || {};
        const { filter, filterTo, type } = condition;

        const isRange = type == 'inRange' || numberOfInputs === 2;
        const formatValue = this.formatValue.bind(this);

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
