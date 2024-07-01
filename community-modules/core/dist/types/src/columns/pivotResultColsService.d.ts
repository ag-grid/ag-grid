import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { ColumnEventType } from '../events';
import type { ColKey, ColumnCollections } from './columnModel';
export declare class PivotResultColsService extends BeanStub implements NamedBean {
    beanName: "pivotResultColsService";
    private context;
    private columnModel;
    private columnFactory;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    private pivotResultCols;
    private previousPivotResultCols;
    destroy(): void;
    isPivotResultColsPresent(): boolean;
    lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null;
    getPivotResultCols(): ColumnCollections | null;
    getPivotResultCol(key: ColKey): AgColumn | null;
    setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void;
    private processPivotResultColDef;
}
