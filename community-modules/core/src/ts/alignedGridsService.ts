import { ColumnModel } from "./columns/columnModel";
import { Logger } from "./logger";
import { LoggerFactory } from "./logger";
import {
    AgEvent,
    BodyScrollEvent,
    ColumnEvent,
    ColumnGroupOpenedEvent,
    ColumnMovedEvent,
    ColumnPinnedEvent,
    ColumnResizedEvent,
    ColumnVisibleEvent,
    Events
} from "./events";
import { GridOptions } from "./entities/gridOptions";
import { Column } from "./entities/column";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { Autowired } from "./context/context";
import { PostConstruct } from "./context/context";
import { ProvidedColumnGroup } from "./entities/providedColumnGroup";
import { BeanStub } from "./context/beanStub";
import { CtrlsService } from "./ctrlsService";

@Bean('alignedGridsService')
export class AlignedGridsService extends BeanStub {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private logger: Logger;

    // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
    // while processing a master event) we mark this if consuming an event, and if we are, then
    // we don't fire back any events.
    private consuming = false;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
    }

    @PostConstruct
    private init(): void {
        this.addManagedListener(this.eventService,  Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService,  Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService,  Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService,  Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService,  Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
        this.addManagedListener(this.eventService,  Events.EVENT_BODY_SCROLL, this.fireScrollEvent.bind(this));
    }

    // common logic across all the fire methods
    private fireEvent(callback: (alignedGridService: AlignedGridsService) => void): void {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }

        // iterate through the aligned grids, and pass each aligned grid service to the callback
        const otherGrids = this.gridOptionsService.get('alignedGrids');
        if (otherGrids) {
            otherGrids.forEach((otherGridOptions) => {
                if (otherGridOptions.api) {
                    const alignedGridService = otherGridOptions.api.__getAlignedGridService();
                    callback(alignedGridService);
                }
            });
        }
    }

    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    private onEvent(callback: () => void): void {
        this.consuming = true;
        callback();
        this.consuming = false;
    }

    private fireColumnEvent(event: ColumnEvent): void {
        this.fireEvent(alignedGridsService => {
            alignedGridsService.onColumnEvent(event);
        });
    }

    private fireScrollEvent(event: BodyScrollEvent): void {
        if (event.direction !== 'horizontal') { return; }
        this.fireEvent(alignedGridsService => {
            alignedGridsService.onScrollEvent(event);
        });
    }

    private onScrollEvent(event: BodyScrollEvent): void {
        this.onEvent(() => {
            const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
            gridBodyCon.getScrollFeature().setHorizontalScrollPosition(event.left);
        });
    }

    public getMasterColumns(event: ColumnEvent): Column[] {
        const result: Column[] = [];
        if (event.columns) {
            event.columns.forEach((column: Column) => {
                result.push(column);
            });
        } else if (event.column) {
            result.push(event.column);
        }
        return result;
    }

    public getColumnIds(event: ColumnEvent): string[] {
        const result: string[] = [];
        if (event.columns) {
            event.columns.forEach(column => {
                result.push(column.getColId());
            });
        } else if (event.column) {
            result.push(event.column.getColId());
        }
        return result;
    }

    public onColumnEvent(event: AgEvent): void {
        this.onEvent(() => {

            switch (event.type) {

                case Events.EVENT_COLUMN_MOVED:
                case Events.EVENT_COLUMN_VISIBLE:
                case Events.EVENT_COLUMN_PINNED:
                case Events.EVENT_COLUMN_RESIZED:
                    const colEvent = event as ColumnEvent;
                    this.processColumnEvent(colEvent);
                    break;

                case Events.EVENT_COLUMN_GROUP_OPENED:
                    const groupOpenedEvent = event as ColumnGroupOpenedEvent;
                    this.processGroupOpenedEvent(groupOpenedEvent);
                    break;

                case Events.EVENT_COLUMN_PIVOT_CHANGED:
                    // we cannot support pivoting with aligned grids as the columns will be out of sync as the
                    // grids will have columns created based on the row data of the grid.
                    console.warn('AG Grid: pivoting is not supported with aligned grids. ' +
                        'You can only use one of these features at a time in a grid.');
                    break;
            }

        });
    }

    private processGroupOpenedEvent(groupOpenedEvent: ColumnGroupOpenedEvent): void {
        // likewise for column group
        const masterColumnGroup = groupOpenedEvent.columnGroup;
        let otherColumnGroup: ProvidedColumnGroup | null = null;

        if (masterColumnGroup) {
            const groupId = masterColumnGroup.getGroupId();
            otherColumnGroup = this.columnModel.getProvidedColumnGroup(groupId);
        }

        if (masterColumnGroup && !otherColumnGroup) { return; }

        this.logger.log('onColumnEvent-> processing ' + groupOpenedEvent + ' expanded = ' + masterColumnGroup.isExpanded());
        this.columnModel.setColumnGroupOpened(otherColumnGroup, masterColumnGroup.isExpanded(), "alignedGridChanged");
    }

    private processColumnEvent(colEvent: ColumnEvent): void {
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        const masterColumn = colEvent.column;
        let otherColumn: Column | null = null;

        if (masterColumn) {
            otherColumn = this.columnModel.getPrimaryColumn(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) { return; }

        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        const masterColumns = this.getMasterColumns(colEvent);

        switch (colEvent.type) {
            case Events.EVENT_COLUMN_MOVED:
                // when the user moves columns via applyColumnState, we can't depend on moving specific columns
                // to an index, as there maybe be many indexes columns moved to (as wasn't result of a mouse drag).
                // so only way to be sure is match the order of all columns using Column State.
                {
                    const movedEvent = colEvent as ColumnMovedEvent;
                    const srcColState = colEvent.columnApi.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId }));
                    this.columnModel.applyColumnState(
                        { state: destColState, applyOrder: true }, "alignedGridChanged"
                    );
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} toIndex = ${movedEvent.toIndex}`);
                }
                break;
            case Events.EVENT_COLUMN_VISIBLE:
                // when the user changes visibility via applyColumnState, we can't depend on visibility flag in event
                // as there maybe be mix of true/false (as wasn't result of a mouse click to set visiblity).
                // so only way to be sure is match the visibility of all columns using Column State.
                {
                    const visibleEvent = colEvent as ColumnVisibleEvent;
                    const srcColState = colEvent.columnApi.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId, hide: s.hide }));
                    this.columnModel.applyColumnState({ state: destColState }, "alignedGridChanged");
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} visible = ${visibleEvent.visible}`);
                }
                break;
            case Events.EVENT_COLUMN_PINNED:
                {
                    const pinnedEvent = colEvent as ColumnPinnedEvent;
                    const srcColState = colEvent.columnApi.getColumnState();
                    const destColState = srcColState.map(s => ({ colId: s.colId, pinned: s.pinned }));
                    this.columnModel.applyColumnState({state: destColState}, "alignedGridChanged");
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} pinned = ${pinnedEvent.pinned}`);
                }
                break;
            case Events.EVENT_COLUMN_RESIZED:
                const resizedEvent = colEvent as ColumnResizedEvent;

                const columnWidths: {
                    [key: string]: {
                        key: string | Column;
                        newWidth: number;
                    }
                } = {};
                masterColumns.forEach((column: Column) => {
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} actualWidth = ${column.getActualWidth()}`);
                    columnWidths[column.getId()] = {key: column.getColId(), newWidth: column.getActualWidth()};
                });
                // don't set flex columns width
                resizedEvent.flexColumns?.forEach(col => {
                    if (columnWidths[col.getId()]) {
                        delete columnWidths[col.getId()];
                    }
                });
                this.columnModel.setColumnWidths(Object.values(columnWidths), false, resizedEvent.finished, "alignedGridChanged");
                break;
        }
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const isVerticalScrollShowing = gridBodyCon.isVerticalScrollShowing();
        const alignedGrids = this.gridOptionsService.get('alignedGrids');

        if (alignedGrids) {
            alignedGrids.forEach((grid) => {
                if (grid.api) {
                    grid.api.setAlwaysShowVerticalScroll(isVerticalScrollShowing);
                }
            });
        }
    }
}
