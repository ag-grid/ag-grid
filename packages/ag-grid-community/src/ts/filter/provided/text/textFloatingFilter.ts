import {TextFilter, TextFilterModel} from "./textFilter";
import {AbstractTextInputFloatingFilter} from "../../floating/provided/abstractTextInputFloatingFilter";

export class TextFloatingFilter extends AbstractTextInputFloatingFilter {

    protected conditionToString(condition: TextFilterModel): string {
        // it's not possible to have 'in range' for string, so no need to check for it.
        // also cater for when the type doesn't need a value
        if (condition.filter!=null) {
            return `${condition.filter}`;
        } else {
            return `${condition.type}`;
        }
    }

    protected getModelFromText(value: string): TextFilterModel {
        if (!value) {
            return null;
        } else {
            return {
                type: null,
                filter: value,
                filterType: 'text'
            };
        }
    }

    protected getDefaultFilterOptions(): string[] {
        return TextFilter.DEFAULT_FILTER_OPTIONS;
    }

}
