import {IComponent} from "../../interfaces/iComponent";
import {Column} from "../../entities/column";
import {GridApi} from "../../gridApi";
import {SerializedSetFilter} from "../../interfaces/iSerializedSetFilter";
import {CombinedFilter} from "../provided/abstractFilter";
import {AbstractTextFloatingFilterComp} from "./abstractTextFloatingFilter";

export interface FloatingFilterChange {
}

export interface IFloatingFilterParams<M, F extends FloatingFilterChange> {
    column: Column;
    onFloatingFilterChanged: (change: F | M) => boolean;
    currentParentModel: () => M;
    suppressFilterButton: boolean;
    debounceMs?: number;
    api: GridApi;
}

export interface IFloatingFilter<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> {
    onParentModelChanged(parentModel: M, combinedModel?:CombinedFilter<M>): void;
}

export interface IFloatingFilterComp<M, F extends FloatingFilterChange, P extends IFloatingFilterParams<M, F>> extends IFloatingFilter<M, F, P>, IComponent<P> {
}

export interface BaseFloatingFilterChange<M> extends FloatingFilterChange {
    model: M;
    apply: boolean;
}

export class SetFloatingFilterComp extends AbstractTextFloatingFilterComp<SerializedSetFilter, IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>> {
    init(params: IFloatingFilterParams<SerializedSetFilter, BaseFloatingFilterChange<SerializedSetFilter>>): void {
        super.init(params);
        this.eColumnFloatingFilter.disabled = true;
    }

    asFloatingFilterText(parentModel: string[] | SerializedSetFilter): string {
        this.eColumnFloatingFilter.disabled = true;
        if (!parentModel) { return ''; }

        // also supporting old filter model for backwards compatibility
        const values: string[] = (parentModel instanceof Array) ? parentModel : parentModel.values;

        if (values.length === 0) { return ''; }

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
