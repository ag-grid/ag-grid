import { TextFilter, TextFilterModel } from './textFilter';
import { FloatingFilterInputService, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
export declare class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter;
    init(params: IFloatingFilterParams<TextFilter>): void;
    protected getDefaultFilterOptions(): string[];
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
    protected createFloatingFilterInputService(ariaLabel: string): FloatingFilterInputService;
}
