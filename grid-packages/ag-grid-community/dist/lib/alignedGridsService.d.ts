import { GridPanel } from "./gridPanel/gridPanel";
import { AgEvent, ColumnEvent } from "./events";
import { Column } from "./entities/column";
import { BeanStub } from "./context/beanStub";
export declare class AlignedGridsService extends BeanStub {
    private gridOptionsWrapper;
    private columnController;
    private logger;
    private gridPanel;
    private consuming;
    private setBeans;
    registerGridComp(gridPanel: GridPanel): void;
    private init;
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
