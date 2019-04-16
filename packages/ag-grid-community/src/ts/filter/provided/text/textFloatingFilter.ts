import {AbstractTextFloatingFilterComp} from "../../floating/abstractTextFloatingFilter";
import {SerializedTextFilter} from "./textFilter";
import {BaseFloatingFilterChange, IFloatingFilterParams} from "../../floating/floatingFilter";

export class TextFloatingFilterComp extends AbstractTextFloatingFilterComp<SerializedTextFilter, IFloatingFilterParams<SerializedTextFilter, BaseFloatingFilterChange<SerializedTextFilter>>> {
    asFloatingFilterText(parentModel: SerializedTextFilter): string {
        if (!parentModel) { return ''; }
        return parentModel.filter;
    }

    asParentModel(): SerializedTextFilter {
        const currentParentModel = this.currentParentModel();
        return {
            type: currentParentModel.type,
            filter: this.eColumnFloatingFilter.value,
            filterType: 'text'
        };
    }

    parseAsText(model: SerializedTextFilter): string {
        return this.asFloatingFilterText(model);
    }
}
