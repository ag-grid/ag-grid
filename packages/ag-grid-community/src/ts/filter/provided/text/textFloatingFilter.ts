import {AbstractTextFloatingFilterComp} from "../../floating/abstractTextFloatingFilter";
import {TextFilterModel} from "./textFilter";
import {BaseFloatingFilterChange, IFloatingFilterParams} from "../../floating/floatingFilter";

export class TextFloatingFilterComp extends AbstractTextFloatingFilterComp<TextFilterModel, IFloatingFilterParams<TextFilterModel, BaseFloatingFilterChange<TextFilterModel>>> {
    asFloatingFilterText(parentModel: TextFilterModel): string {
        if (!parentModel) { return ''; }
        return parentModel.filter;
    }

    asParentModel(): TextFilterModel {
        const currentParentModel = this.currentParentModel();
        return {
            type: currentParentModel.type,
            filter: this.eColumnFloatingFilter.value,
            filterType: 'text'
        };
    }

    parseAsText(model: TextFilterModel): string {
        return this.asFloatingFilterText(model);
    }
}
