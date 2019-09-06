// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { NumberFilterModel } from "./numberFilter";
import { TextInputFloatingFilter } from "../../floating/provided/textInputFloatingFilter";
export declare class NumberFloatingFilter extends TextInputFloatingFilter {
    protected getDefaultFilterOptions(): string[];
    protected conditionToString(condition: NumberFilterModel): string;
}
