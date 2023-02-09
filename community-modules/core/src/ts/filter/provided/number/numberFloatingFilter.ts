import { NumberFilter, NumberFilterModel, NumberFilterModelFormatter } from './numberFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';

export class NumberFloatingFilter extends TextInputFloatingFilter<NumberFilterModel> {
    private filterModelFormatter: SimpleFilterModelFormatter;

    public init(params: IFloatingFilterParams<NumberFilter>): void {
        super.init(params);
        this.filterModelFormatter = new NumberFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }
}
