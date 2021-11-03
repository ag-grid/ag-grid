import { NumberFilter, NumberFilterModel } from './numberFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';

export class NumberFloatingFilter extends TextInputFloatingFilter<NumberFilterModel> {
    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }
}
