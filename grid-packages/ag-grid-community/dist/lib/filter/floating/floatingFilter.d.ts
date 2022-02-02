import { IComponent } from '../../interfaces/iComponent';
import { Column } from '../../entities/column';
import { GridApi } from '../../gridApi';
import { ProvidedFilterModel, IFilterParams, IFilter } from '../../interfaces/iFilter';
import { FilterChangedEvent } from '../../events';
export interface IFloatingFilterParent {
    /**
     * Notification that a new floating-filter value was input by the user.
     *
     * @param type operation type selected.
     * @param value model-typed value entered.
     */
    onFloatingFilterChanged(type: string | null, value: any): void;
}
declare type InbuiltParentType = IFloatingFilterParent & IFilter;
export declare type IFloatingFilterParentCallback<P = InbuiltParentType> = (parentFilterInstance: P) => void;
export interface IFloatingFilterParams<P = InbuiltParentType> {
    /** The column this filter is for. */
    column: Column;
    /**
     * The params object passed to the filter.
     * This is to allow the floating filter access to the configuration of the parent filter.
     * For example, the provided filters use debounceMs from the parent filter params.
     * */
    filterParams: IFilterParams;
    /**
     * Boolean flag to indicate if the button in the floating filter that opens the parent filter in a popup should be displayed.
     */
    suppressFilterButton: boolean;
    api: GridApi;
    /**
     * This is a shortcut to invoke getModel on the parent filter.
     * If the parent filter doesn't exist (filters are lazily created as needed)
     * then it returns null rather than calling getModel() on the parent filter.
     */
    currentParentModel: () => any;
    /**
     * Gets a reference to the parent filter. The result is returned asynchronously
     * via a callback as the parent filter may not exist yet. If it does
     * not exist, it is created and asynchronously returned (AG Grid itself
     * does not create components asynchronously, however if providing a framework
     * provided filter e.g. React, it might be).
     *
     * The floating filter can then call any method it likes on the parent filter.
     * The parent filter will typically provide its own method for the floating
     * filter to call to set the filter. For example, if creating custom filter A,
     * it should have a method your floating A can call to set the state
     * when the user updates via the floating filter.
     */
    parentFilterInstance: (callback: IFloatingFilterParentCallback<P>) => void;
    /**
     * Shows the parent filter popup.
     */
    showParentFilter: () => void;
}
export interface IFloatingFilter {
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent | null): void;
}
export interface IFloatingFilterComp<P = any> extends IFloatingFilter, IComponent<IFloatingFilterParams<P>> {
}
export interface BaseFloatingFilterChange {
    model: ProvidedFilterModel;
    apply: boolean;
}
export {};
