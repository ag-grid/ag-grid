// Type definitions for ag-grid v16.0.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgEvent, ColumnEvent } from "./events";
import { Column } from "./entities/column";
export declare class AlignedGridsService {
    private instanceId;
    private gridOptionsWrapper;
    private columnController;
    private gridPanel;
    private eventService;
    private logger;
    private consuming;
    private setBeans(loggerFactory);
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
