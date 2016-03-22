// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "./logger";
import { ColumnChangeEvent } from "./columnChangeEvent";
import { Column } from "./entities/column";
export declare class MasterSlaveService {
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private eventService;
    private logger;
    private consuming;
    agWire(loggerFactory: LoggerFactory): void;
    init(): void;
    private fireEvent(callback);
    private onEvent(callback);
    private fireColumnEvent(event);
    fireHorizontalScrollEvent(horizontalScroll: number): void;
    onScrollEvent(horizontalScroll: number): void;
    getMasterColumns(event: ColumnChangeEvent): Column[];
    getColumnIds(event: ColumnChangeEvent): string[];
    onColumnEvent(event: ColumnChangeEvent): void;
}
