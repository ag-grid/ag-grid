export class BaseGridSerializingSession {
    constructor(config) {
        this.groupColumns = [];
        const { columnModel, valueService, gridOptionsService, valueFormatterService, valueParserService, processCellCallback, processHeaderCallback, processGroupHeaderCallback, processRowGroupCallback, } = config;
        this.columnModel = columnModel;
        this.valueService = valueService;
        this.gridOptionsService = gridOptionsService;
        this.valueFormatterService = valueFormatterService;
        this.valueParserService = valueParserService;
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
        const hideOpenParents = this.gridOptionsService.get('groupHideOpenParents');
        const value = ((!hideOpenParents || node.footer) && this.shouldRenderGroupSummaryCell(node, column, index))
            ? this.createValueForGroupNode(column, node)
            : this.valueService.getValue(column, node);
        const processedValue = this.processCell({
            accumulatedRowIndex,
            rowNode: node,
            column,
            value,
            processCellCallback: this.processCellCallback,
            type
        });
        return processedValue;
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
            if (((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()]) != null) {
                return true;
            }
            if (this.gridOptionsService.isRowModelType('serverSide') && node.group) {
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
            return callback(this.gridOptionsService.addGridCommonParams({ column }));
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    }
    createValueForGroupNode(column, node) {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback(this.gridOptionsService.addGridCommonParams({ column, node }));
        }
        const isTreeData = this.gridOptionsService.get('treeData');
        const isSuppressGroupMaintainValueType = this.gridOptionsService.get('suppressGroupMaintainValueType');
        // if not tree data and not suppressGroupMaintainValueType then we get the value from the group data
        const getValueFromNode = (node) => {
            var _a, _b;
            if (isTreeData || isSuppressGroupMaintainValueType) {
                return node.key;
            }
            const value = (_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()];
            if (!value || !node.rowGroupColumn || node.rowGroupColumn.getColDef().useValueFormatterForExport === false) {
                return value;
            }
            return (_b = this.valueFormatterService.formatValue(node.rowGroupColumn, node, value)) !== null && _b !== void 0 ? _b : value;
        };
        const isFooter = node.footer;
        const keys = [getValueFromNode(node)];
        if (!this.gridOptionsService.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(getValueFromNode(node));
            }
        }
        const groupValue = keys.reverse().join(' -> ');
        return isFooter ? `Total ${groupValue}` : groupValue;
    }
    processCell(params) {
        var _a;
        const { accumulatedRowIndex, rowNode, column, value, processCellCallback, type } = params;
        if (processCellCallback) {
            return {
                value: (_a = processCellCallback(this.gridOptionsService.addGridCommonParams({
                    accumulatedRowIndex,
                    column: column,
                    node: rowNode,
                    value: value,
                    type: type,
                    parseValue: (valueToParse) => this.valueParserService.parseValue(column, rowNode, valueToParse, this.valueService.getValue(column, rowNode)),
                    formatValue: (valueToFormat) => { var _a; return (_a = this.valueFormatterService.formatValue(column, rowNode, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; }
                }))) !== null && _a !== void 0 ? _a : ''
            };
        }
        if (column.getColDef().useValueFormatterForExport !== false) {
            return {
                value: value !== null && value !== void 0 ? value : '',
                valueFormatted: this.valueFormatterService.formatValue(column, rowNode, value),
            };
        }
        return { value: value !== null && value !== void 0 ? value : '' };
    }
}
