// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import GridOptionsWrapper from "./gridOptionsWrapper";
import { ColumnController } from "./columnController/columnController";
import GridPanel from "./gridPanel/gridPanel";
import EventService from "./eventService";
import { LoggerFactory } from "./logger";
import ColumnChangeEvent from "./columnChangeEvent";
import Column from "./entities/column";
export default class MasterSlaveService {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private logger;
    private eventService;
    private consuming;
    init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, gridPanel: GridPanel, loggerFactory: LoggerFactory, eventService: EventService): void;
    private fireEvent(callback);
    private onEvent(callback);
    private fireColumnEvent(event);
    fireHorizontalScrollEvent(horizontalScroll: number): void;
    onScrollEvent(horizontalScroll: number): void;
    getMasterColumns(event: ColumnChangeEvent): Column[];
    getColumnIds(event: ColumnChangeEvent): string[];
    onColumnEvent(event: ColumnChangeEvent): void;
}
