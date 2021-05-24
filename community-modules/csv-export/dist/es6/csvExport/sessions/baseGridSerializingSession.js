import { _ } from "@ag-grid-community/core";
var BaseGridSerializingSession = /** @class */ (function () {
    function BaseGridSerializingSession(config) {
        this.groupColumns = [];
        var columnController = config.columnController, valueService = config.valueService, gridOptionsWrapper = config.gridOptionsWrapper, processCellCallback = config.processCellCallback, processHeaderCallback = config.processHeaderCallback, processGroupHeaderCallback = config.processGroupHeaderCallback, processRowGroupCallback = config.processRowGroupCallback;
        this.columnController = columnController;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }
    BaseGridSerializingSession.prototype.prepare = function (columnsToExport) {
        this.groupColumns = _.filter(columnsToExport, function (col) { return !!col.getColDef().showRowGroup; });
    };
    BaseGridSerializingSession.prototype.extractHeaderValue = function (column) {
        var value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    };
    BaseGridSerializingSession.prototype.extractRowCellValue = function (column, index, accumulatedRowIndex, type, node) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        var groupIndex = this.gridOptionsWrapper.isGroupMultiAutoColumn() ? node.rowGroupIndex : 0;
        var renderGroupSummaryCell = 
        // on group rows
        node && node.group
            && (
            // in the group column if groups appear in regular grid cells
            index === groupIndex && this.groupColumns.indexOf(column) !== -1
                // or the first cell in the row, if we're doing full width rows
                || (index === 0 && this.gridOptionsWrapper.isGroupUseEntireRow(this.columnController.isPivotMode())));
        var valueForCell;
        if (renderGroupSummaryCell) {
            valueForCell = this.createValueForGroupNode(node);
        }
        else {
            valueForCell = this.valueService.getValue(column, node);
        }
        var value = this.processCell(accumulatedRowIndex, node, column, valueForCell, this.processCellCallback, type);
        return value != null ? value : '';
    };
    BaseGridSerializingSession.prototype.getHeaderName = function (callback, column) {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }
        return this.columnController.getDisplayNameForColumn(column, 'csv', true);
    };
    BaseGridSerializingSession.prototype.createValueForGroupNode = function (node) {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
            });
        }
        var keys = [node.key];
        if (!this.gridOptionsWrapper.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(node.key);
            }
        }
        return keys.reverse().join(' -> ');
    };
    BaseGridSerializingSession.prototype.processCell = function (accumulatedRowIndex, rowNode, column, value, processCellCallback, type) {
        if (processCellCallback) {
            return processCellCallback({
                accumulatedRowIndex: accumulatedRowIndex,
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
    };
    return BaseGridSerializingSession;
}());
export { BaseGridSerializingSession };
