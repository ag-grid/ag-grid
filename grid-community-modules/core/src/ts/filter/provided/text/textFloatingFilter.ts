import { TextFilter, TextFilterModel } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';

export class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }
}
