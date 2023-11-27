// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
import { GridState } from "../interfaces/gridState";
export declare class StateService extends BeanStub {
    private readonly filterManager;
    private readonly rangeService?;
    private readonly ctrlsService;
    private readonly sideBarService?;
    private readonly focusService;
    private readonly columnModel;
    private readonly paginationProxy;
    private readonly rowModel;
    private readonly selectionService;
    private readonly expansionService;
    private isClientSideRowModel;
    private cachedState;
    private suppressEvents;
    private queuedUpdateSources;
    private dispatchStateUpdateEventDebounced;
    private postConstruct;
    getState(): GridState;
    private setupStateOnGridReady;
    private setupStateOnColumnsInitialised;
    private setupStateOnRowCountReady;
    private setupStateOnFirstDataRendered;
    private getColumnState;
    private setColumnState;
    private getColumnGroupState;
    private setColumnGroupState;
    private getFilterState;
    private setFilterState;
    private getRangeSelectionState;
    private setRangeSelectionState;
    private getScrollState;
    private setScrollState;
    private getSideBarState;
    private getFocusedCellState;
    private setFocusedCellState;
    private getPaginationState;
    private setPaginationState;
    private getRowSelectionState;
    private setRowSelectionState;
    private getRowGroupExpansionState;
    private setRowGroupExpansionState;
    private updateColumnState;
    private updateCachedState;
    private dispatchStateUpdateEvent;
    private dispatchQueuedStateUpdateEvents;
}
