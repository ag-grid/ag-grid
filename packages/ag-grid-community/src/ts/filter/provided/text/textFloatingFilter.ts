import { TextFilter, TextFilterModel } from "./textFilter";
import { TextInputFloatingFilter } from "../../floating/provided/textInputFloatingFilter";

export class TextFloatingFilter extends TextInputFloatingFilter {

    protected conditionToString(condition: TextFilterModel): string {
        // it's not possible to have 'in range' for string, so no need to check for it.
        // also cater for when the type doesn't need a value
        if (condition.filter != null) {
            return `${condition.filter}`;
        } else {
            return `${condition.type}`;
        }
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

}
