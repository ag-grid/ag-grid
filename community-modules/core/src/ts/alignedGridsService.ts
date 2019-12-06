import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { ColumnController } from "./columnController/columnController";
import { GridPanel } from "./gridPanel/gridPanel";
import { Logger } from "./logger";
import { EventService } from "./eventService";
import { LoggerFactory } from "./logger";
import {
    AgEvent, BodyScrollEvent,
    ColumnEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnResizedEvent, ColumnVisibleEvent,
    Events
} from "./events";
import { GridOptions } from "./entities/gridOptions";
import { Column } from "./entities/column";
import { Bean } from "./context/context";
import { Qualifier } from "./context/context";
import { Autowired } from "./context/context";
import { PostConstruct } from "./context/context";
import { OriginalColumnGroup } from "./entities/originalColumnGroup";

@Bean('alignedGridsService')
export class AlignedGridsService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    private logger: Logger;
    private gridPanel: GridPanel;

    // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
    // while processing a master event) we mark this if consuming an event, and if we are, then
    // we don't fire back any events.
    private consuming = false;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    public init(): void {
        this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
        this.eventService.addEventListener(Events.EVENT_BODY_SCROLL, this.fireScrollEvent.bind(this));
    }

    // common logic across all the fire methods
    private fireEvent(callback: (alignedGridService: AlignedGridsService) => void): void {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }

        // iterate through the aligned grids, and pass each aligned grid service to the callback
        const otherGrids = this.gridOptionsWrapper.getAlignedGrids();
        if (otherGrids) {
            otherGrids.forEach((otherGridOptions: GridOptions) => {
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
            this.gridPanel.setHorizontalScrollPosition(event.left);
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
                    console.warn('ag-Grid: pivoting is not supported with aligned grids. ' +
                        'You can only use one of these features at a time in a grid.');
                    break;
            }

        });
    }

    private processGroupOpenedEvent(groupOpenedEvent: ColumnGroupOpenedEvent): void {
        // likewise for column group
        const masterColumnGroup = groupOpenedEvent.columnGroup;
        let otherColumnGroup: OriginalColumnGroup | undefined;
        if (masterColumnGroup) {
            const groupId = masterColumnGroup.getGroupId();
            otherColumnGroup = this.columnController.getOriginalColumnGroup(groupId);
        }
        if (masterColumnGroup && !otherColumnGroup) { return; }

        this.logger.log('onColumnEvent-> processing ' + groupOpenedEvent + ' expanded = ' + masterColumnGroup.isExpanded());
        this.columnController.setColumnGroupOpened(otherColumnGroup, masterColumnGroup.isExpanded(), "alignedGridChanged");
    }

    private processColumnEvent(colEvent: ColumnEvent): void {
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        const masterColumn = colEvent.column;
        let otherColumn: Column | undefined;

        if (masterColumn) {
            otherColumn = this.columnController.getPrimaryColumn(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) { return; }

        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        const columnIds = this.getColumnIds(colEvent);
        const masterColumns = this.getMasterColumns(colEvent);

        switch (colEvent.type) {
            case Events.EVENT_COLUMN_MOVED:
                const movedEvent = colEvent as ColumnMovedEvent;
                this.logger.log(`onColumnEvent-> processing ${colEvent.type} toIndex = ${movedEvent.toIndex}`);
                this.columnController.moveColumns(columnIds, movedEvent.toIndex, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_VISIBLE:
                const visibleEvent = colEvent as ColumnVisibleEvent;
                this.logger.log(`onColumnEvent-> processing ${colEvent.type} visible = ${visibleEvent.visible}`);
                this.columnController.setColumnsVisible(columnIds, visibleEvent.visible, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_PINNED:
                const pinnedEvent = colEvent as ColumnPinnedEvent;
                this.logger.log(`onColumnEvent-> processing ${colEvent.type} pinned = ${pinnedEvent.pinned}`);
                this.columnController.setColumnsPinned(columnIds, pinnedEvent.pinned, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_RESIZED:
                const resizedEvent = colEvent as ColumnResizedEvent;

                masterColumns.forEach((column: Column) => {
                    this.logger.log(`onColumnEvent-> processing ${colEvent.type} actualWidth = ${column.getActualWidth()}`);
                    this.columnController.setColumnWidth(column.getColId(), column.getActualWidth(), false, resizedEvent.finished, "alignedGridChanged");
                });
                break;
        }
        const isVerticalScrollShowing = this.gridPanel.isVerticalScrollShowing();
        const alignedGrids = this.gridOptionsWrapper.getAlignedGrids();

        alignedGrids.forEach((grid) => {
            grid.api.setAlwaysShowVerticalScroll(isVerticalScrollShowing);
        });
    }
}