import { ColumnModel } from "../columns/columnModel";
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, Optional, PostConstruct } from "../context/context";
import { CtrlsService } from "../ctrlsService";
import { Events } from "../eventKeys";
import { NewColumnsLoadedEvent } from "../events";
import { FilterManager } from "../filter/filterManager";
import { FocusService } from "../focusService";
import { FilterState, FocusedCellState, GridState, PaginationState, RangeSelectionState, ScrollState, SideBarState } from "../interfaces/gridState";
import { IRangeService } from "../interfaces/IRangeService";
import { ISideBarService } from "../interfaces/iSideBar";
import { PaginationProxy } from "../pagination/paginationProxy";

@Bean('stateService')
export class StateService extends BeanStub {
    @Autowired('filterManager') private filterManager: FilterManager;
    @Optional('rangeService') private rangeService?: IRangeService;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Optional('sideBarService') private sideBarService?: ISideBarService;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, (event: NewColumnsLoadedEvent) => {
            if (event.source === 'gridInitializing') {
                this.setInitialStateOnColumnsInitialised();
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_FIRST_DATA_RENDERED, () => this.setInitialStateOnFirstDataRendered());
    }

    public getState(): GridState {
        return {
            filter: this.getFilterState(),
            rangeSelection: this.getRangeSelectionState(),
            scroll: this.getScrollState(),
            sideBar: this.getSideBarState(),
            focusedCell: this.getFocusedCellState(),
            pagination: this.getPaginationState()
        };
    }

    private setInitialStateOnColumnsInitialised(): void {
        const { filter: filterState } = this.gridOptionsService.get('initialState') ?? {};
        if (filterState) {
            this.filterManager.setFilterModel(filterState);
        }
    }

    private setInitialStateOnFirstDataRendered(): void {
        const {
            scroll: scrollState,
            rangeSelection: rangeSelectionState,
            focusedCell: focusedCellState,
            pagination: paginationState
        } = this.gridOptionsService.get('initialState') ?? {};
        const updateAfterPageLoad = () => {
            if (focusedCellState) {
                this.setFocusedCellState(focusedCellState);
            }
            if (rangeSelectionState) {
                this.setRangeSelectionState(rangeSelectionState);
            }
            if (scrollState) {
                this.setScrollState(scrollState);
            }
        }
        if (paginationState) {
            this.setPaginationState(paginationState);
            setTimeout(() => updateAfterPageLoad());
        } else {
            updateAfterPageLoad();
        }
    }

    private getFilterState(): FilterState | undefined {
        const filterModel = this.filterManager.getFilterModel();
        return filterModel === {} ? undefined : filterModel;
    }

    private getRangeSelectionState(): RangeSelectionState | undefined {
        const cellRanges = this.rangeService?.getCellRanges().map(cellRange => {
            const { id, type, startRow, endRow, columns, startColumn } = cellRange;
            return {
                id,
                type,
                startRow,
                endRow,
                colIds: columns.map(column => column.getColId()),
                startColId: startColumn.getColId()
            }
        });
        return cellRanges?.length ? { cellRanges } : undefined;
    }

    private setRangeSelectionState(rangeSelectionState: RangeSelectionState): void {
        const cellRanges = rangeSelectionState.cellRanges.map(cellRange => ({
            ...cellRange,
            columns: cellRange.colIds.map(colId => this.columnModel.getGridColumn(colId)!),
            startColumn: this.columnModel.getGridColumn(cellRange.startColId)!
        }));
        this.rangeService?.setCellRanges(cellRanges);
    }

    private getScrollState(): ScrollState | undefined {
        const scrollFeature = this.ctrlsService.getGridBodyCtrl()?.getScrollFeature();
        const { left } = scrollFeature?.getHScrollPosition() ?? {};
        const { top } = scrollFeature?.getVScrollPosition() ?? {};
        return top || left ? {
            top,
            left
        } : undefined;
    }

    private setScrollState(scrollState: ScrollState): void {
        const { top, left } = scrollState;
        this.ctrlsService.getGridBodyCtrl()?.getScrollFeature().setScrollPosition(top, left);
    }

    private getSideBarState(): SideBarState | undefined {
        const sideBarComp = this.sideBarService?.getSideBarComp();
        if (sideBarComp) {
            return {
                visible: sideBarComp.isDisplayed(),
                position: sideBarComp.getSideBarPosition(),
                openToolPanel: sideBarComp.openedItem()
            };
        }
        return undefined;
    }

    private getFocusedCellState(): FocusedCellState | undefined {
        const focusedCell = this.focusService.getFocusedCell();
        if (focusedCell) {
            const { column, rowIndex, rowPinned } = focusedCell;
            return {
                colId: column.getColId(),
                rowIndex,
                rowPinned
            };
        }
        return undefined;
    }

    private setFocusedCellState(focusedCellState: FocusedCellState): void {
        const { colId, rowIndex, rowPinned } = focusedCellState;
        this.focusService.setFocusedCell({
            column: this.columnModel.getGridColumn(colId),
            rowIndex,
            rowPinned,
            forceBrowserFocus: true,
            preventScrollOnBrowserFocus: true
        });
    }

    private getPaginationState(): PaginationState | undefined {
        const page = this.paginationProxy.getCurrentPage();
        return page ? { page } : undefined;
    }

    private setPaginationState(paginationState: PaginationState): void {
        this.paginationProxy.goToPage(paginationState.page);
    }
}