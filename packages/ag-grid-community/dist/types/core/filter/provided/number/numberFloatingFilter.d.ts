import type { FloatingFilterInputService } from '../../floating/provided/iFloatingFilterInputService';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import type { SimpleFilterModelFormatter } from '../simpleFilterModelFormatter';
import type { INumberFloatingFilterParams, NumberFilterModel } from './iNumberFilter';
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
