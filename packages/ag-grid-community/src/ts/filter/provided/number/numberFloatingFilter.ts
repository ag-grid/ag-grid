import {NumberFilter, NumberFilterModel} from "./numberFilter";
import {AbstractSimpleFilter} from "../abstractSimpleFilter";
import {_} from "../../../utils";
import {AbstractTextInputFloatingFilter} from "../../floating/abstractTextInputFloatingFilter";

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

    protected getModelFromText(value: string): NumberFilterModel {
        if (!value) {
            return null;
        } else {
            return {
                type: null,
                filter: this.stringToFloat(value),
                filterType: 'text'
            };
        }
    }

    private stringToFloat(value: string): number {
        let filterText = _.makeNull(value);
        if (filterText && filterText.trim() === '') {
            filterText = null;
        }
        let newFilter: number;
        if (filterText !== null && filterText !== undefined) {
            newFilter = parseFloat(filterText);
        } else {
            newFilter = null;
        }
        return newFilter;
    }
}
