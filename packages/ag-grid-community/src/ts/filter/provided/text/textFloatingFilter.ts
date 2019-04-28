import { AbstractTextfieldFloatingFilterComp } from "../../floating/abstractTextfieldFloatingFilter";
import { TextFilterModel } from "./textFilter";
import { BaseFloatingFilterChange, IFloatingFilterParams } from "../../floating/floatingFilter";

export class TextFloatingFilterComp extends AbstractTextfieldFloatingFilterComp<TextFilterModel, IFloatingFilterParams<TextFilterModel, BaseFloatingFilterChange<TextFilterModel>>> {

    asFloatingFilterText(parentModel: TextFilterModel): string {
        if (!parentModel) { return ''; }
        return parentModel.filter;
    }

    asParentModel(): TextFilterModel {
        // const currentParentModel = this.currentParentModel();
        return {
            type: null,
            filter: this.eColumnFloatingFilter.value,
            filterType: 'text'
        };
    }

    parseAsText(model: TextFilterModel): string {
        return this.asFloatingFilterText(model);
    }
}
