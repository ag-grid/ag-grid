"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseGridSerializingSession = /** @class */ (function () {
    function BaseGridSerializingSession(config) {
        this.groupColumns = [];
        var columnModel = config.columnModel, valueService = config.valueService, gridOptionsWrapper = config.gridOptionsWrapper, processCellCallback = config.processCellCallback, processHeaderCallback = config.processHeaderCallback, processGroupHeaderCallback = config.processGroupHeaderCallback, processRowGroupCallback = config.processRowGroupCallback;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.processGroupHeaderCallback = processGroupHeaderCallback;
        this.processRowGroupCallback = processRowGroupCallback;
    }
    BaseGridSerializingSession.prototype.prepare = function (columnsToExport) {
        this.groupColumns = columnsToExport.filter(function (col) { return !!col.getColDef().showRowGroup; });
    };
    BaseGridSerializingSession.prototype.extractHeaderValue = function (column) {
        var value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    };
    BaseGridSerializingSession.prototype.extractRowCellValue = function (column, index, accumulatedRowIndex, type, node) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        var value = this.shouldRenderGroupSummaryCell(node, column, index)
            ? this.createValueForGroupNode(node)
            : this.valueService.getValue(column, node);
        var processedValue = this.processCell({
            accumulatedRowIndex: accumulatedRowIndex,
            rowNode: node,
            column: column,
            value: value,
            processCellCallback: this.processCellCallback,
            type: type
        });
        return processedValue != null ? processedValue : '';
    };
    BaseGridSerializingSession.prototype.shouldRenderGroupSummaryCell = function (node, column, currentColumnIndex) {
        var _a;
        var isGroupNode = node && node.group;
        // only on group rows
        if (!isGroupNode) {
            return false;
        }
        var currentColumnGroupIndex = this.groupColumns.indexOf(column);
        if (currentColumnGroupIndex !== -1 && ((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()])) {
            return true;
        }
        var isGroupUseEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow(this.columnModel.isPivotMode());
        return currentColumnIndex === 0 && isGroupUseEntireRow;
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
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
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
    BaseGridSerializingSession.prototype.processCell = function (params) {
        var accumulatedRowIndex = params.accumulatedRowIndex, rowNode = params.rowNode, column = params.column, value = params.value, processCellCallback = params.processCellCallback, type = params.type;
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
exports.BaseGridSerializingSession = BaseGridSerializingSession;
