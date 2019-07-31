// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { TextFilterModel } from "./textFilter";
import { TextInputFloatingFilter } from "../../floating/provided/textInputFloatingFilter";
export declare class TextFloatingFilter extends TextInputFloatingFilter {
    protected conditionToString(condition: TextFilterModel): string;
    protected getDefaultFilterOptions(): string[];
}
