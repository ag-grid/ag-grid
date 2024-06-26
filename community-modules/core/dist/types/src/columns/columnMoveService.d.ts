import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { ColKey } from './columnModel';
export declare class ColumnMoveService extends BeanStub implements NamedBean {
    beanName: "columnMoveService";
    private columnModel;
    private columnAnimationService;
    private eventDispatcher;
    wireBeans(beans: BeanCollection): void;
    moveColumnByIndex(fromIndex: number, toIndex: number, source: ColumnEventType): void;
    moveColumns(columnsToMoveKeys: ColKey[], toIndex: number, source: ColumnEventType, finished?: boolean): void;
    private doesMovePassRules;
    doesOrderPassRules(gridOrder: AgColumn[]): boolean;
    getProposedColumnOrder(columnsToMove: AgColumn[], toIndex: number): AgColumn[];
    private doesMovePassLockedPositions;
    doesMovePassMarryChildren(allColumnsCopy: AgColumn[]): boolean;
    placeLockedColumns(cols: AgColumn[]): AgColumn[];
}
