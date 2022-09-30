// Type definitions for @ag-grid-community/core v28.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TextFilterModel } from './textFilter';
import { TextInputFloatingFilter } from '../../floating/provided/textInputFloatingFilter';
export declare class TextFloatingFilter extends TextInputFloatingFilter<TextFilterModel> {
    protected getDefaultFilterOptions(): string[];
}
