import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { ITextFloatingFilterParams, TextFilterModel } from './iTextFilter';
export declare class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter;
    init(params: ITextFloatingFilterParams): void;
    onParamsUpdated(params: ITextFloatingFilterParams): void;
    refresh(params: ITextFloatingFilterParams): void;
    protected getDefaultFilterOptions(): string[];
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
    protected createFloatingFilterInputService(): FloatingFilterInputService;
}
