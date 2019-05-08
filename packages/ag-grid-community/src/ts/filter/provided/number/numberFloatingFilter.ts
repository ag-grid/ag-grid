import {NumberFilter, NumberFilterModel} from "./numberFilter";
import {AbstractSimpleFilter} from "../abstractSimpleFilter";
import {AbstractTextInputFloatingFilter} from "../../floating/provided/abstractTextInputFloatingFilter";

export class NumberFloatingFilter extends AbstractTextInputFloatingFilter {

    protected getDefaultFilterOptions(): string[] {
        return NumberFilter.DEFAULT_FILTER_OPTIONS;
    }

    protected conditionToString(condition: NumberFilterModel): string {

        const isRange = condition.type == AbstractSimpleFilter.IN_RANGE;

        if (isRange) {
            return `${condition.filter}-${condition.filterTo}`;
        } else {
            // cater for when the type doesn't need a value
            if (condition.filter!=null) {
                return `${condition.filter}`;
            } else {
                return `${condition.type}`;
            }
        }
    }

}
