import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';
import type { Column } from '../interfaces/iColumn';
import type { ColKey } from './columnModel';
export interface ColumnResizeSet {
    columns: AgColumn[];
    ratios: number[];
    width: number;
}
export interface IColumnLimit {
    /** Selector for the column to which these dimension limits will apply */
    key: Column | string;
    /** Defines a minimum width for this column (does not override the column minimum width) */
    minWidth?: number;
    /** Defines a maximum width for this column (does not override the column maximum width) */
    maxWidth?: number;
}
export interface ISizeColumnsToFitParams {
    /** Defines a default minimum width for every column (does not override the column minimum width) */
    defaultMinWidth?: number;
    /** Defines a default maximum width for every column (does not override the column maximum width) */
    defaultMaxWidth?: number;
    /** Provides a minimum and/or maximum width to specific columns */
    columnLimits?: IColumnLimit[];
}
export declare class ColumnSizeService extends BeanStub implements NamedBean {
    beanName: "columnSizeService";
    private columnModel;
    private columnViewportService;
    private eventDispatcher;
    private visibleColsService;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private flexViewportWidth;
    setColumnWidths(columnWidths: {
        key: ColKey;
        newWidth: number;
    }[], shiftKey: boolean, // @takeFromAdjacent - if user has 'shift' pressed, then pixels are taken from adjacent column
    finished: boolean, // @finished - ends up in the event, tells the user if more events are to come
    source: ColumnEventType): void;
    resizeColumnSets(params: {
        resizeSets: ColumnResizeSet[];
        finished: boolean;
        source: ColumnEventType;
    }): void;
    private checkMinAndMaxWidthsForSet;
    refreshFlexedColumns(params?: {
        resizingCols?: AgColumn[];
        skipSetLeft?: boolean;
        viewportWidth?: number;
        source?: ColumnEventType;
        fireResizedEvent?: boolean;
        updateBodyWidths?: boolean;
    }): AgColumn[];
    sizeColumnsToFit(gridWidth: any, source?: ColumnEventType, silent?: boolean, params?: ISizeColumnsToFitParams): void;
    applyAutosizeStrategy(): void;
}
