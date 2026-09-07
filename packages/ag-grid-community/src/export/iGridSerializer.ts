import type { ColumnModel } from '../columns/columnModel';
import type { ColumnNameService } from '../columns/columnNameService';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import type {
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
} from '../interfaces/exportParams';
import type { IRowGroupColsService } from '../interfaces/iColsService';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { LogService } from '../validation/logService';
import type { ValueService } from '../valueService/valueService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface RowAccumulator {
    onColumn(column: AgColumn, index: number, node?: RowNode): void;
}

interface GridHeaderCellBase {
    columnIndex: number;
    columnSpan: number;
    rowSpan: number;
}

export interface GridColumnHeaderCell extends GridHeaderCellBase {
    type: 'column';
    column: AgColumn;
}

export interface GridGroupHeaderCell extends GridHeaderCellBase {
    type: 'group' | 'padding';
    /** Backing group; padding cells created purely to tile a row have none. */
    column?: AgColumnGroup;
    collapsibleGroupRanges?: number[][];
}

export interface GridCoveredHeaderCell extends GridHeaderCellBase {
    type: 'covered';
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type GridHeaderCell = GridColumnHeaderCell | GridGroupHeaderCell | GridCoveredHeaderCell;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface HeaderRowAccumulator {
    onCell(cell: GridHeaderCell): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface GridSerializingParams {
    colModel: ColumnModel;
    rowGroupColsSvc?: IRowGroupColsService;
    colNames: ColumnNameService;
    valueSvc: ValueService;
    gos: GridOptionsService;
    /** Grid-scoped log service, so serializing diagnostics are attributed to the emitting grid. */
    log: LogService;
    valueFrom?: CellValueResolveFrom;
    /** Apply the Show Values As transform on top of the `valueFrom` base. */
    transformValues?: boolean;
    processCellCallback?: (params: ProcessCellForExportParams) => string;
    processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;
}

export interface GridSerializingSession<T> {
    readonly useGridHeaderLayout: boolean;
    prepare(columnsToExport: AgColumn[]): void;
    onNewHeaderGroupingRow(): HeaderRowAccumulator;
    onNewHeaderRow(): HeaderRowAccumulator;
    onNewBodyRow(node?: RowNode): RowAccumulator;
    addCustomContent(customContent: T): void;

    /**
     * FINAL RESULT
     */
    parse(): string;
}
