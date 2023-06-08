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
        var hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        var value = ((!hideOpenParents || node.footer) && this.shouldRenderGroupSummaryCell(node, column, index))
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
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context
            });
        }
        return this.columnModel.getDisplayNameForColumn(column, 'csv', true);
    };
    BaseGridSerializingSession.prototype.createValueForGroupNode = function (node) {
        if (this.processRowGroupCallback) {
            return this.processRowGroupCallback({
                node: node,
                api: this.gridOptionsService.api,
                columnApi: this.gridOptionsService.columnApi,
                context: this.gridOptionsService.context,
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
        var _this = this;
        var _a;
        var accumulatedRowIndex = params.accumulatedRowIndex, rowNode = params.rowNode, column = params.column, value = params.value, processCellCallback = params.processCellCallback, type = params.type;
        if (processCellCallback) {
            return {
                value: (_a = processCellCallback({
                    accumulatedRowIndex: accumulatedRowIndex,
                    column: column,
                    node: rowNode,
                    value: value,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context,
                    type: type,
                    parseValue: function (valueToParse) { return _this.valueParserService.parseValue(column, rowNode, valueToParse, _this.valueService.getValue(column, rowNode)); },
                    formatValue: function (valueToFormat) { var _a; return (_a = _this.valueFormatterService.formatValue(column, rowNode, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; }
                })) !== null && _a !== void 0 ? _a : ''
            };
        }
        if (column.getColDef().useValueFormatterForExport) {
            return {
                value: value !== null && value !== void 0 ? value : '',
                valueFormatted: this.valueFormatterService.formatValue(column, rowNode, value),
            };
        }
        return { value: value !== null && value !== void 0 ? value : '' };
    };
    return BaseGridSerializingSession;
}());
export { BaseGridSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUdyaWRTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L3Nlc3Npb25zL2Jhc2VHcmlkU2VyaWFsaXppbmdTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQTtJQWFJLG9DQUFZLE1BQTZCO1FBRmpDLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBSTVCLElBQUEsV0FBVyxHQVNYLE1BQU0sWUFUSyxFQUNYLFlBQVksR0FRWixNQUFNLGFBUk0sRUFDWixrQkFBa0IsR0FPbEIsTUFBTSxtQkFQWSxFQUNsQixxQkFBcUIsR0FNckIsTUFBTSxzQkFOZSxFQUNyQixrQkFBa0IsR0FLbEIsTUFBTSxtQkFMWSxFQUNsQixtQkFBbUIsR0FJbkIsTUFBTSxvQkFKYSxFQUNuQixxQkFBcUIsR0FHckIsTUFBTSxzQkFIZSxFQUNyQiwwQkFBMEIsR0FFMUIsTUFBTSwyQkFGb0IsRUFDMUIsdUJBQXVCLEdBQ3ZCLE1BQU0sd0JBRGlCLENBQ2hCO1FBRVgsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzdDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7UUFDN0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFRTSw0Q0FBTyxHQUFkLFVBQWUsZUFBeUI7UUFDcEMsSUFBSSxDQUFD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