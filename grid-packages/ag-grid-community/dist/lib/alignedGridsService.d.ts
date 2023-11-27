import { AgEvent, ColumnEvent } from "./events";
import { Column } from "./entities/column";
import { BeanStub } from "./context/beanStub";
export declare class AlignedGridsService extends BeanStub {
    private columnModel;
    private ctrlsService;
    private logger;
    private consuming;
    private setBeans;
    private getAlignedGridApis;
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
