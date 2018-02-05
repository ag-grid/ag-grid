import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ColumnController} from "./columnController/columnController";
import {GridPanel} from "./gridPanel/gridPanel";
import {Logger} from "./logger";
import {EventService} from "./eventService";
import {LoggerFactory} from "./logger";
import {
    AgEvent, BodyScrollEvent,
    ColumnEvent, ColumnGroupOpenedEvent, ColumnMovedEvent, ColumnPinnedEvent, ColumnResizedEvent, ColumnVisibleEvent,
    Events
} from "./events";
import {GridOptions} from "./entities/gridOptions";
import {Column} from "./entities/column";
import {ColumnGroup} from "./entities/columnGroup";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {Autowired} from "./context/context";
import {PostConstruct} from "./context/context";
import {OriginalColumnGroup} from "./entities/originalColumnGroup";

let counter = 0;

@Bean('alignedGridsService')
export class AlignedGridsService {

    private instanceId = counter++;

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('gridPanel') private gridPanel: GridPanel;
    @Autowired('eventService') private eventService: EventService;

    private logger: Logger;

    // flag to mark if we are consuming. to avoid cyclic events (ie other grid firing back to master
    // while processing a master event) we mark this if consuming an event, and if we are, then
    // we don't fire back any events.
    private consuming = false;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('AlignedGridsService');
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
    private fireEvent(callback: (alignedGridService: AlignedGridsService)=>void): void {
        // if we are already consuming, then we are acting on an event from a master,
        // so we don't cause a cyclic firing of events
        if (this.consuming) {
            return;
        }

        // iterate through the aligned grids, and pass each aligned grid service to the callback
        let otherGrids = this.gridOptionsWrapper.getAlignedGrids();
        if (otherGrids) {
            otherGrids.forEach( (otherGridOptions: GridOptions) => {
                if (otherGridOptions.api) {
                    let alignedGridService = otherGridOptions.api.__getAlignedGridService();
                    callback(alignedGridService);
                }
            });
        }
    }

    // common logic across all consume methods. very little common logic, however extracting
    // guarantees consistency across the methods.
    private onEvent(callback: ()=>void): void {
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
        if (event.direction!=='horizontal') { return; }
        this.fireEvent( alignedGridsService => {
            alignedGridsService.onScrollEvent(event);
        });
    }

    private onScrollEvent(event: BodyScrollEvent): void {
        this.onEvent(()=> {
            this.gridPanel.setHorizontalScrollPosition(event.left);
        });
    }

    public getMasterColumns(event: ColumnEvent): Column[] {
        let result: Column[] = [];
        if (event.columns) {
            event.columns.forEach( (column: Column) => {
                result.push(column);
            });
        } else if (event.column) {
            result.push(event.column);
        }
        return result;
    }

    public getColumnIds(event: ColumnEvent): string[] {
        let result: string[] = [];
        if (event.columns) {
            event.columns.forEach( column => {
                result.push(column.getColId());
            });
        } else if (event.columns) {
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
                    let colEvent = <ColumnEvent> event;
                    this.processColumnEvent(colEvent);
                    break;

                case Events.EVENT_COLUMN_GROUP_OPENED:
                    let groupOpenedEvent = <ColumnGroupOpenedEvent> event;
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
        let masterColumnGroup = groupOpenedEvent.columnGroup;
        let otherColumnGroup: OriginalColumnGroup;
        if (masterColumnGroup) {
            let groupId = masterColumnGroup.getGroupId();
            otherColumnGroup = this.columnController.getOriginalColumnGroup(groupId);
        }
        if (masterColumnGroup && !otherColumnGroup) { return; }

        this.logger.log('onColumnEvent-> processing '+event+' expanded = '+ masterColumnGroup.isExpanded());
        this.columnController.setColumnGroupOpened(otherColumnGroup, masterColumnGroup.isExpanded(), "alignedGridChanged");
    }

    private processColumnEvent(colEvent: ColumnEvent): void {
        // the column in the event is from the master grid. need to
        // look up the equivalent from this (other) grid
        let masterColumn = colEvent.column;
        let otherColumn: Column;
        if (masterColumn) {
            otherColumn = this.columnController.getPrimaryColumn(masterColumn.getColId());
        }
        // if event was with respect to a master column, that is not present in this
        // grid, then we ignore the event
        if (masterColumn && !otherColumn) { return; }

        // in time, all the methods below should use the column ids, it's a more generic way
        // of handling columns, and also allows for single or multi column events
        let columnIds = this.getColumnIds(colEvent);
        let masterColumns = this.getMasterColumns(colEvent);

        switch (colEvent.type) {
            case Events.EVENT_COLUMN_MOVED:
                let movedEvent = <ColumnMovedEvent> colEvent;
                this.logger.log('onColumnEvent-> processing '+colEvent.type+' toIndex = ' + movedEvent.toIndex);
                this.columnController.moveColumns(columnIds, movedEvent.toIndex, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_VISIBLE:
                let visibleEvent = <ColumnVisibleEvent> colEvent;
                this.logger.log('onColumnEvent-> processing '+colEvent.type+' visible = '+ visibleEvent.visible);
                this.columnController.setColumnsVisible(columnIds, visibleEvent.visible, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_PINNED:
                let pinnedEvent = <ColumnPinnedEvent> colEvent;
                this.logger.log('onColumnEvent-> processing '+colEvent.type+' pinned = '+ pinnedEvent.pinned);
                this.columnController.setColumnsPinned(columnIds, pinnedEvent.pinned, "alignedGridChanged");
                break;
            case Events.EVENT_COLUMN_RESIZED:
                let resizedEvent = <ColumnResizedEvent> colEvent;
                masterColumns.forEach( (masterColumn: Column)=> {
                    this.logger.log('onColumnEvent-> processing '+colEvent.type+' actualWidth = '+ masterColumn.getActualWidth());
                    this.columnController.setColumnWidth(masterColumn.getColId(), masterColumn.getActualWidth(), resizedEvent.finished, "alignedGridChanged");
                });
                break;
        }
    }
}
