import { FloatingFilterTextInputService } from '../../floating/provided/floatingFilterTextInputService';
import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { ITextFloatingFilterParams, TextFilterModel } from './iTextFilter';
import { DEFAULT_TEXT_FILTER_OPTIONS } from './textFilterConstants';
import { TextFilterModelFormatter } from './textFilterModelFormatter';

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
        return DEFAULT_TEXT_FILTER_OPTIONS;
    }

    protected getFilterModelFormatter(): SimpleFilterModelFormatter {
        return this.filterModelFormatter;
    }

    protected createFloatingFilterInputService(): FloatingFilterInputService {
        return this.createManagedBean(new FloatingFilterTextInputService());
    }
}
