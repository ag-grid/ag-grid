import type { ColumnChangedEventType } from '../columns/columnApi';
import type { ColKey, Maybe } from '../columns/columnModel';
import type { ColumnState, ColumnStateParams } from '../columns/columnStateService';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, IAggFunc } from '../entities/colDef';
import type { ColumnEventType } from '../events';

type ColumnProcessorKeys = 'add' | 'remove' | 'set';
type ColumnProcessor = (column: AgColumn, added: boolean, source: ColumnEventType) => void;
export type ColumnProcessors = Record<ColumnProcessorKeys, ColumnProcessor>;

export type ColumnOrdering = {
    enableProp: 'rowGroup' | 'pivot';
    initialEnableProp: 'initialRowGroup' | 'initialPivot';
    indexProp: 'rowGroupIndex' | 'pivotIndex';
    initialIndexProp: 'initialRowGroupIndex' | 'initialPivotIndex';
};

export type ColumnExtractors = {
    setFlagFunc: (col: AgColumn, flag: boolean, source: ColumnEventType) => void;
    getIndexFunc: (colDef: ColDef) => number | null | undefined;
    getInitialIndexFunc: (colDef: ColDef) => number | null | undefined;
    getValueFunc: (colDef: ColDef) => boolean | null | undefined;
    getInitialValueFunc: (colDef: ColDef) => boolean | undefined;
};

export interface IColsService {
    columns: AgColumn[];
    eventName: ColumnChangedEventType;
    columnProcessors?: ColumnProcessors;
    columnOrdering?: ColumnOrdering;
    columnExtractors?: ColumnExtractors;
    setColumns(colKeys: ColKey[], source: ColumnEventType): void;
    addColumns(keys: Maybe<ColKey>[], source: ColumnEventType): void;
    removeColumns(keys: Maybe<ColKey>[] | null, source: ColumnEventType): void;
    extractCols(source: ColumnEventType, oldProvidedCols: AgColumn[] | undefined): void;
    syncColumnWithState(
        column: AgColumn,
        source: ColumnEventType,
        getValue: <U extends keyof ColumnStateParams, S extends keyof ColumnStateParams>(
            key1: U,
            key2?: S
        ) => { value1: ColumnStateParams[U] | undefined; value2: ColumnStateParams[S] | undefined },
        rowIndex?: { [key: string]: number } | null
    ): void;
    sortColumns(compareFn?: (a: AgColumn, b: AgColumn) => number): void;
    orderColumns(
        columnStateAccumulator: { [colId: string]: ColumnState },
        incomingColumnState: { [colId: string]: ColumnState }
    ): { [colId: string]: ColumnState };

    // RowGroup
    isRowGroupEmpty?(): boolean;
    moveColumn?(fromIndex: number, toIndex: number, source: ColumnEventType): void;

    // Value
    setColumnAggFunc?(key: ColKey, aggFunc: string | IAggFunc | null | undefined, source: ColumnEventType): void;
}
