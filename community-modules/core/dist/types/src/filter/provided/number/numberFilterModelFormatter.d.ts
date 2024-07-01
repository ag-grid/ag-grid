import type { IFilterOptionDef } from '../../../interfaces/iFilter';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { NumberFilterModel } from './iNumberFilter';
export declare class NumberFilterModelFormatter extends SimpleFilterModelFormatter<number> {
    protected conditionToString(condition: NumberFilterModel, options?: IFilterOptionDef): string;
}
