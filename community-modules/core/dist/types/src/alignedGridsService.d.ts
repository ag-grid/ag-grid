import type { NamedBean } from './context/bean';
import { BeanStub } from './context/beanStub';
import type { BeanCollection } from './context/context';
import type { AgColumn } from './entities/agColumn';
import type { AgEvent, ColumnEvent } from './events';
export declare class AlignedGridsService extends BeanStub implements NamedBean {
    beanName: "alignedGridsService";
    private columnModel;
    private columnSizeService;
    private ctrlsService;
    private columnApplyStateService;
    wireBeans(beans: BeanCollection): void;
    private consuming;
    private getAlignedGridApis;
    private isGridApi;
    postConstruct(): void;
    private fireEvent;
    private onEvent;
    private fireColumnEvent;
    private fireScrollEvent;
    private onScrollEvent;
    getMasterColumns(event: ColumnEvent): AgColumn[];
    getColumnIds(event: ColumnEvent): string[];
    onColumnEvent(event: AgEvent): void;
    private processGroupOpenedEvent;
    private processColumnEvent;
}
