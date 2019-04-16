import {AbstractTextFloatingFilterComp, SerializedSetFilter, IFloatingFilterParams, BaseFloatingFilterChange} from "ag-grid-community";

export class SetFloatingFilterComp extends AbstractTextFloatingFilterComp<SerializedSetFilter, IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>> {
    init(params: IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    asFloatingFilterText(parentModel: string[] | SerializedSetFilter): string {
        this.eColumnFloatingFilter.disabled = true;
        if (!parentModel) { return ''; }

        // also supporting old filter model for backwards compatibility
        const values: string[] | null = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (!values || values.length === 0) { return ''; }

        const arrayToDisplay = values.length > 10 ? values.slice(0, 10).concat('...') : values;
        return `(${values.length}) ${arrayToDisplay.join(",")}`;
    }

    parseAsText(model: SerializedSetFilter): string {
        return this.asFloatingFilterText(model);
    }

    asParentModel(): SerializedSetFilter {
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

    equalModels(left: SerializedSetFilter, right: SerializedSetFilter): boolean {
        return false;
    }
}
