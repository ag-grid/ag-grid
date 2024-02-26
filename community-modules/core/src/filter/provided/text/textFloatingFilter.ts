import { TextFilter, TextFilterModel, TextFilterModelFormatter } from './textFilter';
import { FloatingFilterInputService, FloatingFilterTextInputService, ITextInputFloatingFilterParams, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';

export interface ITextFloatingFilterParams extends ITextInputFloatingFilterParams {
}

export class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter: SimpleFilterModelFormatter;

    public init(params: ITextFloatingFilterParams): void {
        super.init(params);
        this.filterModelFormatter = new TextFilterModelFormatter(this.localeService, this.optionsFactory);
    }

    public onParamsUpdated(params: ITextFloatingFilterParams): void {
        this.refresh(params);
    }

    public refresh(params: ITextFloatingFilterParams): void {
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
