import { NumberFilterModel } from './numberFilter';
import { FloatingFilterInputService, ITextInputFloatingFilterParams, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
export interface INumberFloatingFilterParams extends ITextInputFloatingFilterParams {
}
export declare class NumberFloatingFilter extends TextInputFloatingFilter<NumberFilterModel> {
    private filterModelFormatter;
    private allowedCharPattern;
    init(params: INumberFloatingFilterParams): void;
    onParamsUpdated(params: INumberFloatingFilterParams): void;
    refresh(params: INumberFloatingFilterParams): void;
    protected getDefaultFilterOptions(): string[];
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
    protected createFloatingFilterInputService(params: INumberFloatingFilterParams): FloatingFilterInputService;
}
