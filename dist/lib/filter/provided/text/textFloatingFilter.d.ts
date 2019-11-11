import { TextFilterModel } from "./textFilter";
import { TextInputFloatingFilter } from "../../floating/provided/textInputFloatingFilter";
export declare class TextFloatingFilter extends TextInputFloatingFilter {
    protected conditionToString(condition: TextFilterModel): string;
    protected getDefaultFilterOptions(): string[];
}
