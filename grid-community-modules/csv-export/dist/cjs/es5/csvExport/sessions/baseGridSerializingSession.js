"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGridSerializingSession = void 0;
var BaseGridSerializingSession = /** @class */ (function () {
    function BaseGridSerializingSession(config) {
        this.groupColumns = [];
        var columnModel = config.columnModel, valueService = config.valueService, gridOptionsService = config.gridOptionsService, valueFormatterService = config.valueFormatterService, valueParserService = config.valueParserService, processCellCallback = config.processCellCallback, processHeaderCallback = config.processHeaderCallback, processGroupHeaderCallback = config.processGroupHeaderCallback, processRowGroupCallback = config.processRowGroupCallback;
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
    BaseGridSerializingSession.prototype.prepare = function (columnsToExport) {
        this.groupColumns = columnsToExport.filter(function (col) { return !!col.getColDef().showRowGroup; });
    };
    BaseGridSerializingSession.prototype.extractHeaderValue = function (column) {
        var value = this.getHeaderName(this.processHeaderCallback, column);
        return value != null ? value : '';
    };
    BaseGridSerializingSession.prototype.extractRowCellValue = function (column, index, accumulatedRowIndex, type, node) {
        // we render the group summary text e.g. "-> Parent -> Child"...
        var hideOpenParents = this.gridOptionsService.get('groupHideOpenParents');
        var value = ((!hideOpenParents || node.footer) && this.shouldRenderGroupSummaryCell(node, column, index))
            ? this.createValueForGroupNode(column, node)
            : this.valueService.getValue(column, node);
        var processedValue = this.processCell({
            accumulatedRowIndex: accumulatedRowIndex,
            rowNode: node,
            column: column,
            value: value,
            processCellCallback: this.processCellCallback,
            type: type
        });
        return processedValue;
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
            if (((_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()]) != null) {
                return true;
            }
            if (this.gridOptionsService.isRowModelType('serverSide') && node.group) {
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
            return callback(this.gridOptionsService.addGridCommonParams({ column: column }));
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    };
    BaseGridSerializingSession.prototype.createValueForGroupNode = function (column, node) {
        var _this = this;
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback(this.gridOptionsService.addGridCommonParams({ column: column, node: node }));
        }
        var isTreeData = this.gridOptionsService.get('treeData');
        var isSuppressGroupMaintainValueType = this.gridOptionsService.get('suppressGroupMaintainValueType');
        // if not tree data and not suppressGroupMaintainValueType then we get the value from the group data
        var getValueFromNode = function (node) {
            var _a, _b;
            if (isTreeData || isSuppressGroupMaintainValueType) {
                return node.key;
            }
            var value = (_a = node.groupData) === null || _a === void 0 ? void 0 : _a[column.getId()];
            if (!value || !node.rowGroupColumn || node.rowGroupColumn.getColDef().useValueFormatterForExport === false) {
                return value;
            }
            return (_b = _this.valueFormatterService.formatValue(node.rowGroupColumn, node, value)) !== null && _b !== void 0 ? _b : value;
        };
        var isFooter = node.footer;
        var keys = [getValueFromNode(node)];
        if (!this.gridOptionsService.isGroupMultiAutoColumn()) {
            while (node.parent) {
                node = node.parent;
                keys.push(getValueFromNode(node));
            }
        }
        var groupValue = keys.reverse().join(' -> ');
        return isFooter ? "Total ".concat(groupValue) : groupValue;
    };
    BaseGridSerializingSession.prototype.processCell = function (params) {
        var _this = this;
        var _a;
        var accumulatedRowIndex = params.accumulatedRowIndex, rowNode = params.rowNode, column = params.column, value = params.value, processCellCallback = params.processCellCallback, type = params.type;
        if (processCellCallback) {
            return {
                value: (_a = processCellCallback(this.gridOptionsService.addGridCommonParams({
                    accumulatedRowIndex: accumulatedRowIndex,
                    column: column,
                    node: rowNode,
                    value: value,
                    type: type,
                    parseValue: function (valueToParse) { return _this.valueParserService.parseValue(column, rowNode, valueToParse, _this.valueService.getValue(column, rowNode)); },
                    formatValue: function (valueToFormat) { var _a; return (_a = _this.valueFormatterService.formatValue(column, rowNode, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; }
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
    };
    return BaseGridSerializingSession;
}());
exports.BaseGridSerializingSession = BaseGridSerializingSession;
