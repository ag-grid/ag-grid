// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TextFilterModel } from './textFilter';
import { FloatingFilterInputService, ITextInputFloatingFilterParams, TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
import { SimpleFilterModelFormatter } from '../simpleFilter';
export interface ITextFloatingFilterParams extends ITextInputFloatingFilterParams {
}
export declare class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    private filterModelFormatter;
    init(params: ITextFloatingFilterParams): void;
    onParamsUpdated(params: ITextFloatingFilterParams): void;
    protected getDefaultFilterOptions(): string[];
    protected getFilterModelFormatter(): SimpleFilterModelFormatter;
    protected createFloatingFilterInputService(): FloatingFilterInputService;
}
