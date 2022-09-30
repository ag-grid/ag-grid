import { NumberFilterModel } from './numberFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
export declare class NumberFloatingFilter extends TextInputFloatingFilter<NumberFilterModel> {
    protected getDefaultFilterOptions(): string[];
}
