import type { ColumnModel } from '../columns/columnModel';
import type { ColumnNameService } from '../columns/columnNameService';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import type { GridOptionsService } from '../gridOptionsService';
import type {
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
} from '../interfaces/exportParams';
import type { IRowGroupColsService } from '../interfaces/iColsService';
import type { ColumnGroup } from '../interfaces/iColumn';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { LogService } from '../validation/logService';
import type { ValueService } from '../valueService/valueService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface RowAccumulator {
    onColumn(column: AgColumn, index: number, node?: RowNode): void;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface RowSpanningAccumulator {
    onColumn(
        columnGroup: ColumnGroup,
        header: string,
        index: number,
        span: number,
        collapsibleGroupRanges: number[][]
    ): void;
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
    prepare(columnsToExport: AgColumn[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(node?: RowNode): RowAccumulator;
    addCustomContent(customContent: T): void;

    /**
     * FINAL RESULT
     */
    parse(): string;
}
