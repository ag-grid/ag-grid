import { TextFilter, TextFilterModel } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
import { IFloatingFilterParams } from '../../floating/floatingFilter';
export declare class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter;
    init(params: IFloatingFilterParams<TextFilter>): void;
    protected getDefaultFilterOptions(): string[];
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
}
