"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseGridSerializingSession {
    constructor(config) {
        this.groupColumns = [];
        const { columnModel, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback } = config;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }
    prepare(columnsToExport) {
        this.groupColumns = columnsToExport.filter(col => !!col.getColDef().showRowGroup);
    }
    extractHeaderValue(column) {
        const value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    }
    extractRowCellValue(column, index, accumulatedRowIndex, type, node) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        const groupIndex = this.gridOptionsWrapper.isGroupMultiAutoColumn() ? node.rowGroupIndex : 0;
        const renderGroupSummaryCell = 
        // on group rows
        node && node.group
            && (
            // in the group column if groups appear in regular grid cells
            index === groupIndex && this.groupColumns.indexOf(column) !== -1
                // or the first cell in the row, if we're doing full width rows
                || (index === 0 && this.gridOptionsWrapper.isGroupUseEntireRow(this.columnModel.isPivotMode())));
        let valueForCell;
        if (renderGroupSummaryCell) {
            valueForCell = this.createValueForGroupNode(node);
        }
        else {
            valueForCell = this.valueService.getValue(column, node);
        }
        const value = this.processCell(accumulatedRowIndex, node, column, valueForCell, this.processCellCallback, type);
        return value != null ? value : '';
    }
    getHeaderName(callback, column) {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    }
    createValueForGroupNode(node) {
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
    processCell(accumulatedRowIndex, rowNode, column, value, processCellCallback, type) {
        if (processCellCallback) {
            return processCellCallback({
                accumulatedRowIndex,
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
            });
        }
        return value != null ? value : '';
    }
}
exports.BaseGridSerializingSession = BaseGridSerializingSession;
//# sourceMappingURL=baseGridSerializingSession.js.map