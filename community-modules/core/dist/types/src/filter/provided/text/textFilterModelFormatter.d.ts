import type { IFilterOptionDef } from '../../../interfaces/iFilter';
import { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { TextFilterModel } from './iTextFilter';
export declare class TextFilterModelFormatter extends SimpleFilterModelFormatter {
    protected conditionToString(condition: TextFilterModel, options?: IFilterOptionDef): string;
}
