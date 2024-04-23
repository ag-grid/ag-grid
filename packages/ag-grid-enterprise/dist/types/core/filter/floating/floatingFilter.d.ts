import { Column } from '../../entities/column';
import { FilterChangedEvent } from '../../events';
import { IComponent } from '../../interfaces/iComponent';
import { IFilter, IFilterParams, ProvidedFilterModel } from '../../interfaces/iFilter';
import { AgGridCommon } from '../../interfaces/iCommon';
export interface IFloatingFilterParent {
    /**
     * Notification that a new floating-filter value was input by the user.
     *
     * @param type operation type selected.
     * @param value model-typed value entered.
     */
    onFloatingFilterChanged(type: string | null, value: any): void;
}
type InbuiltParentType = IFloatingFilterParent & IFilter;
export type IFloatingFilterParentCallback<P = InbuiltParentType> = (parentFilterInstance: P) => void;
export interface IFloatingFilterParams<P = InbuiltParentType, TData = any, TContext = any> extends AgGridCommon<TData, TContext> {
    /** The column this filter is for. */
    column: Column;
    /**
     * The params object passed to the filter.
     * This is to allow the floating filter access to the configuration of the parent filter.
     * For example, the provided filters use debounceMs from the parent filter params.
     * */
    filterParams: IFilterParams;
    /** @deprecated v31.1 Use `colDef.suppressFloatingFilterButton` instead. */
    suppressFilterButton: boolean;
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
export interface BaseFloatingFilter {
    /**
     * Optional: A hook to perform any necessary operation just after the GUI for this component has been rendered on the screen.
     * If a parent popup is closed and reopened (e.g. for filters), this method is called each time the component is shown.
     * This is useful for any logic that requires attachment before executing, such as putting focus on a particular DOM element.
     */
    afterGuiAttached?(): void;
}
export interface IFloatingFilter<P = any> extends BaseFloatingFilter {
    /**
     * Gets called every time the parent filter changes.
     * Your floating filter would typically refresh its UI to reflect the new filter state.
     * The provided parentModel is what the parent filter returns from its getModel() method.
     * The event is the FilterChangedEvent that the grid fires.
     */
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent | null): void;
    /** @deprecated v31.1 - Use `refresh` instead */
    onParamsUpdated?(params: IFloatingFilterParams<P>): void;
    /** A hook to perform any necessary operations when the column definition is updated. */
    refresh?(params: IFloatingFilterParams<P>): void;
}
export interface IFloatingFilterComp<P = any> extends IFloatingFilter<P>, IComponent<IFloatingFilterParams<P>> {
}
export interface BaseFloatingFilterChange {
    model: ProvidedFilterModel;
    apply: boolean;
}
export {};
