import type { IFilterOptionDef } from '../../../interfaces/iFilter';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { NumberFilterModel } from './iNumberFilter';

export class NumberFilterModelFormatter extends SimpleFilterModelFormatter<number> {
    protected conditionToString(condition: NumberFilterModel, options?: IFilterOptionDef): string {
        const { numberOfInputs } = options || {};
        const isRange = condition.type == 'inRange' || numberOfInputs === 2;

        if (isRange) {
            return `${this.formatValue(condition.filter)}-${this.formatValue(condition.filterTo)}`;
        }

        // cater for when the type doesn't need a value
        if (condition.filter != null) {
            return this.formatValue(condition.filter);
        }

        return `${condition.type}`;
    }
}
