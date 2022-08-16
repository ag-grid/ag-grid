import {
    Column,
    ColumnModel,
    GridOptionsWrapper,
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    ProcessRowGroupForExportParams,
    RowNode,
    ValueService,
    _
} from "@ag-grid-community/core";

import { GridSerializingParams, GridSerializingSession, RowAccumulator, RowSpanningAccumulator } from "../interfaces";

export abstract class BaseGridSerializingSession<T> implements GridSerializingSession<T> {
    public columnModel: ColumnModel;
    public valueService: ValueService;
    public gridOptionsWrapper: GridOptionsWrapper;
    public processCellCallback?: (params: ProcessCellForExportParams) => string;
    public processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    public processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    public processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;

    private groupColumns: Column[] = [];

    constructor(config: GridSerializingParams) {
        const {
            columnModel, valueService, gridOptionsWrapper, processCellCallback,
            processHeaderCallback, processGroupHeaderCallback,
            processRowGroupCallback
        } = config;

        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }

    abstract addCustomContent(customContent: T): void;
    abstract onNewHeaderGroupingRow(): RowSpanningAccumulator;
    abstract onNewHeaderRow(): RowAccumulator;
    abstract onNewBodyRow(): RowAccumulator;
    abstract parse(): string;

    public prepare(columnsToExport: Column[]): void {
        this.groupColumns = columnsToExport.filter(col => !!col.getColDef().showRowGroup)!;
    }

    public extractHeaderValue(column: Column): string {
        const value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    }

    public extractRowCellValue(column: Column, index: number, accumulatedRowIndex: number, type: string, node: RowNode) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        const isGroupNode = node && node.group;
        let renderGroupSummaryCell = false;

        // on group rows
        if (isGroupNode) {
            const currentColumnIsGroup = this.groupColumns.indexOf(column) !== -1;
            if (currentColumnIsGroup) {
                const isGroupMultiAutoColumn = this.gridOptionsWrapper.isGroupMultiAutoColumn();
                // in the group column if groups appear in regular grid cells
                if (isGroupMultiAutoColumn) {
                    renderGroupSummaryCell = index === node.rowGroupIndex;
                } else {
                    renderGroupSummaryCell = true;
                }
            }

            if (!renderGroupSummaryCell) {
                const isGroupUseEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow(this.columnModel.isPivotMode());
                // or the first cell in the row, if we're doing full width rows
                renderGroupSummaryCell = index === 0 && isGroupUseEntireRow;
            }
        }

        let valueForCell: string;
        if (renderGroupSummaryCell) {
            valueForCell = this.createValueForGroupNode(node);
        } else {
            valueForCell = this.valueService.getValue(column, node);
        }
        const value = this.processCell(accumulatedRowIndex, node, column, valueForCell, this.processCellCallback, type);
        return value != null ? value : '';
    }

    private getHeaderName(callback: ((params: ProcessHeaderForExportParams) => string) | undefined, column: Column): string | null {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                context: this.gridOptionsWrapper.getContext()
            });
        }

        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    }

    private createValueForGroupNode(node: RowNode): string {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                context: this.gridOptionsWrapper.getContext(),
            });
        }
        const keys = [node.key];

        if (!this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(node.key);
            }
        }
        return keys.reverse().join(' -> ');
    }

    private processCell(accumulatedRowIndex: number, rowNode: RowNode, column: Column, value: any, processCellCallback: ((params: ProcessCellForExportParams) => string) | undefined, type: string): any {
        if (processCellCallback) {
            return processCellCallback({
                accumulatedRowIndex,
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi()!,
                columnApi: this.gridOptionsWrapper.getColumnApi()!,
                context: this.gridOptionsWrapper.getContext(),
                type: type
            });
        }

        return value != null ? value : '';
    }
}