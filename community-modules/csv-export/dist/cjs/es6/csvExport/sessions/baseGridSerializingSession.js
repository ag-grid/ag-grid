"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGridSerializingSession = void 0;
class BaseGridSerializingSession {
    constructor(config) {
        this.groupColumns = [];
        const { columnModel, valueService, gridOptionsService, processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback } = config;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsService = gridOptionsService;
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
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
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
        if (currentColumnGroupIndex !== -1) {
            if ((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()]) {
                return true;
            }
            // if this is a top level footer, always render`Total` in the left-most cell
            if (node.footer && node.level === -1) {
                const colDef = column.getColDef();
                const isFullWidth = colDef == null || colDef.showRowGroup === true;
                return isFullWidth || colDef.showRowGroup === this.columnModel.getRowGroupColumns()[0].getId();
            }
        }
        const isGroupUseEntireRow = this.gridOptionsService.isGroupUseEntireRow(this.columnModel.isPivotMode());
        return currentColumnIndex === 0 && isGroupUseEntireRow;
    }
    getHeaderName(callback, column) {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            });
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    }
    createValueForGroupNode(node) {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context,
            });
        }
        const isFooter = node.footer;
        const keys = [node.key];
        if (!this.gridOptionsService.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(node.key);
            }
        }
        const groupValue = keys.reverse().join(' -> ');
        return isFooter ? `Total ${groupValue}` : groupValue;
    }
    processCell(params) {
        const { accumulatedRowIndex, rowNode, column, value, processCellCallback, type } = params;
        if (processCellCallback) {
            return processCellCallback({
                accumulatedRowIndex,
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context,
                type: type
            });
        }
        return value != null ? value : '';
    }
}
exports.BaseGridSerializingSession = BaseGridSerializingSession;
