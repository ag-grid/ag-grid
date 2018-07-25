// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridPanel } from "./gridPanel/gridPanel";
import { AgEvent, ColumnEvent } from "./events";
import { Column } from "./entities/column";
export declare class AlignedGridsService {
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private logger;
    private gridPanel;
    private consuming;
    private setBeans(loggerFactory);
    registerGridComp(gridPanel: GridPanel): void;
    init(): void;
    private fireEvent(callback);
    private onEvent(callback);
    private fireColumnEvent(event);
    private fireScrollEvent(event);
    private onScrollEvent(event);
    getMasterColumns(event: ColumnEvent): Column[];
    getColumnIds(event: ColumnEvent): string[];
    onColumnEvent(event: AgEvent): void;
    private processGroupOpenedEvent(groupOpenedEvent);
    private processColumnEvent(colEvent);
}
