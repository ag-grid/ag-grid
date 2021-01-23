import {
    Column,
    ColumnController,
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
    public columnController: ColumnController;
    public valueService: ValueService;
    public gridOptionsWrapper: GridOptionsWrapper;
    public processCellCallback?: (params: ProcessCellForExportParams) => string;
    public processHeaderCallback?: (params: ProcessHeaderForExportParams) => string;
    public processGroupHeaderCallback?: (params: ProcessGroupHeaderForExportParams) => string;
    public processRowGroupCallback?: (params: ProcessRowGroupForExportParams) => string;

    private groupColumns: Column[] | null | undefined = [];

    constructor(config: GridSerializingParams) {
        const {
            columnController, valueService, gridOptionsWrapper, processCellCallback,
            processHeaderCallback, processGroupHeaderCallback,
            processRowGroupCallback
        } = config;

        this.columnController = columnController;
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
        this.groupColumns = _.filter(columnsToExport, col => !!col.getColDef().showRowGroup);
    }

    public extractHeaderValue(column: Column): string {
        const value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    }

    public extractRowCellValue(column: Column, index: number, type: string, node: RowNode) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        const groupIndex = this.gridOptionsWrapper.isGroupMultiAutoColumn() ? node.rowGroupIndex : 0;
        const renderGroupSummaryCell =
            // on group rows
            node && node.group
            && (
                // in the group column if groups appear in regular grid cells
                index === groupIndex && this.groupColumns!.indexOf(column) !== -1
                // or the first cell in the row, if we're doing full width rows
                || (index === 0 && this.gridOptionsWrapper.isGroupUseEntireRow(this.columnController.isPivotMode()))
            );

        let valueForCell: any;
        if (renderGroupSummaryCell) {
            valueForCell = this.createValueForGroupNode(node);
        } else {
            valueForCell = this.valueService.getValue(column, node);
        }
        const value = this.processCell(node, column, valueForCell, this.processCellCallback, type);
        return value != null ? value : '';
    }

    private getHeaderName(callback: ((params: ProcessHeaderForExportParams) => string) | undefined, column: Column): string | null {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }

        return this.columnController.getDisplayNameForColumn(column, 'csv', true);
    }

    private createValueForGroupNode(node: RowNode): string {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
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

    private processCell(rowNode: RowNode, column: Column, value: any, processCellCallback: ((params: ProcessCellForExportParams) => string) | undefined, type: string): any {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
            });
        }

        return value;
    }
}