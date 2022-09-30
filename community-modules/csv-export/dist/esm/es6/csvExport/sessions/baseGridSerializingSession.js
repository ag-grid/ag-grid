export class BaseGridSerializingSession {
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
        const hideOpenParents = this.gridOptionsWrapper.isGroupHideOpenParents();
        const value = (!hideOpenParents && this.shouldRenderGroupSummaryCell(node, column, index))
            ? this.createValueForGroupNode(node)
            : this.valueService.getValue(column, node);
        const processedValue = this.processCell({
            accumulatedRowIndex,
            rowNode: node,
            column,
            value,
            processCellCallback: this.processCellCallback,
            type
        });
        return processedValue != null ? processedValue : '';
    }
    shouldRenderGroupSummaryCell(node, column, currentColumnIndex) {
        var _a;
        const isGroupNode = node && node.group;
        // only on group rows
        if (!isGroupNode) {
            return false;
        }
        const currentColumnGroupIndex = this.groupColumns.indexOf(column);
        if (currentColumnGroupIndex !== -1 && ((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()])) {
            return true;
        }
        const isGroupUseEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow(this.columnModel.isPivotMode());
        return currentColumnIndex === 0 && isGroupUseEntireRow;
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
    processCell(params) {
        const { accumulatedRowIndex, rowNode, column, value, processCellCallback, type } = params;
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
