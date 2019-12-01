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
    private setBeans;
    registerGridComp(gridPanel: GridPanel): void;
    init(): void;
    private fireEvent;
    private onEvent;
    private fireColumnEvent;
    private fireScrollEvent;
    private onScrollEvent;
    getMasterColumns(event: ColumnEvent): Column[];
    getColumnIds(event: ColumnEvent): string[];
    onColumnEvent(event: AgEvent): void;
    private processGroupOpenedEvent;
    private processColumnEvent;
}
