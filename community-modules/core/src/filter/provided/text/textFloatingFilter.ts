import type {
    FloatingFilterInputService,
    ITextInputFloatingFilterParams,
} from '../../floating/provided/textInputFloatingFilter';
import {
    FloatingFilterTextInputService,
    TextInputFloatingFilter,
} from '../../floating/provided/textInputFloatingFilter';
import type { SimpleFilterModelFormatter } from '../simpleFilter';
import type { TextFilterModel } from './textFilter';
import { TextFilter, TextFilterModelFormatter } from './textFilter';

export interface ITextFloatingFilterParams extends ITextInputFloatingFilterParams {}

export class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter: SimpleFilterModelFormatter;

    public override init(params: ITextFloatingFilterParams): void {
        super.init(params);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    public override onParamsUpdated(params: ITextFloatingFilterParams): void {
        this.refresh(params);
    }

    public override refresh(params: ITextFloatingFilterParams): void {
        super.refresh(params);
        this.filterModelFormatter.updateParams({ optionsFactory: this.optionsFactory });
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }

    protected createFloatingFilterInputService(): FloatingFilterInputService {
        return this.createManagedBean(new FloatingFilterTextInputService());
    }
}
