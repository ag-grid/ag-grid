var BaseGridSerializingSession = /** @class */ (function () {
    function BaseGridSerializingSession(config) {
        this.groupColumns = [];
        var columnModel = config.columnModel, valueService = config.valueService, gridOptionsService = config.gridOptionsService, processCellCallback = config.processCellCallback, processHeaderCallback = config.processHeaderCallback, processGroupHeaderCallback = config.processGroupHeaderCallback, processRowGroupCallback = config.processRowGroupCallback;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsService = gridOptionsService;
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
        var hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        var value = (!hideOpenParents && this.shouldRenderGroupSummaryCell(node, column, index))
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
        if (currentColumnGroupIndex !== -1) {
            if ((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()]) {
                return true;
            }
            // if this is a top level footer, always render`Total` in the left-most cell
            if (node.footer && node.level === -1) {
                var colDef = column.getColDef();
                var isFullWidth = colDef == null || colDef.showRowGroup === true;
                return isFullWidth || colDef.showRowGroup === this.columnModel.getRowGroupColumns()[0].getId();
            }
        }
        var isGroupUseEntireRow = this.gridOptionsService.isGroupUseEntireRow(this.columnModel.isPivotMode());
        return currentColumnIndex === 0 && isGroupUseEntireRow;
    };
    BaseGridSerializingSession.prototype.getHeaderName = function (callback, column) {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsService.get('api'),
                columnApi: this.gridOptionsService.get('columnApi'),
                context: this.gridOptionsService.get('context')
            });
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    };
    BaseGridSerializingSession.prototype.createValueForGroupNode = function (node) {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsService.get('api'),
                columnApi: this.gridOptionsService.get('columnApi'),
                context: this.gridOptionsService.get('context'),
            });
        }
        var isFooter = node.footer;
        var keys = [node.key];
        if (!this.gridOptionsService.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(node.key);
            }
        }
        var groupValue = keys.reverse().join(' -> ');
        return isFooter ? "Total " + groupValue : groupValue;
    };
    BaseGridSerializingSession.prototype.processCell = function (params) {
        var accumulatedRowIndex = params.accumulatedRowIndex, rowNode = params.rowNode, column = params.column, value = params.value, processCellCallback = params.processCellCallback, type = params.type;
        if (processCellCallback) {
            return processCellCallback({
                accumulatedRowIndex: accumulatedRowIndex,
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsService.get('api'),
                columnApi: this.gridOptionsService.get('columnApi'),
                context: this.gridOptionsService.get('context'),
                type: type
            });
        }
        return value != null ? value : '';
    };
    return BaseGridSerializingSession;
}());
export { BaseGridSerializingSession };
