import {AbstractTextfieldFloatingFilterComp, IFloatingFilterParams, BaseFloatingFilterChange} from "ag-grid-community";
import {SetFilterModel} from "./setFilterModel";

export class SetFloatingFilterComp extends AbstractTextfieldFloatingFilterComp<SetFilterModel, IFloatingFilterParams<SetFilterModel, BaseFloatingFilterChange<SetFilterModel>>> {
    init(params: IFloatingFilterParams<SetFilterModel, BaseFloatingFilterChange<SetFilterModel>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    asFloatingFilterText(parentModel: string[] | SetFilterModel): string {
        this.eColumnFloatingFilter.disabled = true;
        if (!parentModel) { return ''; }

        // also supporting old filter model for backwards compatibility
        const values: string[] | null = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (!values || values.length === 0) { return ''; }

        const arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        return `(${values.length}) ${arrayToDisplay.join(",")}`;
    }

    parseAsText(model: SetFilterModel): string {
        return this.asFloatingFilterText(model);
    }

    asParentModel(): SetFilterModel {
        if (this.eColumnFloatingFilter.value == null || this.eColumnFloatingFilter.value === '') {
            return {
                values: [],
                filterType: 'set'
            };
        }
        return {
            values: this.eColumnFloatingFilter.value.split(","),
            filterType: 'set'
        };
    }

    equalModels(left: SetFilterModel, right: SetFilterModel): boolean {
        return false;
    }
}
