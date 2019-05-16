import { NumberFilter, NumberFilterModel } from "./numberFilter";
import { SimpleFilter } from "../simpleFilter";
import { TextInputFloatingFilter } from "../../floating/provided/textInputFloatingFilter";

export class NumberFloatingFilter extends TextInputFloatingFilter {

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: NumberFilterModel): string {

        const isRange = condition.type == SimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        } else {
            // cater for when the type doesn't need a value
            if (condition.filter != null) {
                return `${condition.filter}`;
            } else {
                return `${condition.type}`;
            }
        }
    }

}
