import { TextFilter, TextFilterModel, TextFilterModelFormatter } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';

export class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter: SimpleFilterModelFormatter;

    public init(params: IFloatingFilterParams<TextFilter>): void {
        super.init(params);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }
}
