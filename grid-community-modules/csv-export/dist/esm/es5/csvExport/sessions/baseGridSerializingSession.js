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
        var _a, _b;
        var accumulatedRowIndex = params.accumulatedRowIndex, rowNode = params.rowNode, column = params.column, value = params.value, processCellCallback = params.processCellCallback, type = params.type;
        if (processCellCallback) {
            return processCellCallback({
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
            });
        }
        if (column.getColDef().useValueFormatterForExport) {
            return (_b = (_a = this.valueFormatterService.formatValue(column, rowNode, value)) !== null && _a !== void 0 ? _a : value) !== null && _b !== void 0 ? _b : '';
        }
        return value != null ? value : '';
    };
    return BaseGridSerializingSession;
}());
export { BaseGridSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUdyaWRTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L3Nlc3Npb25zL2Jhc2VHcmlkU2VyaWFsaXppbmdTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQTtJQWFJLG9DQUFZLE1BQTZCO1FBRmpDLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBSTVCLElBQUEsV0FBVyxHQVNYLE1BQU0sWUFUSyxFQUNYLFlBQVksR0FRWixNQUFNLGFBUk0sRUFDWixrQkFBa0IsR0FPbEIsTUFBTSxtQkFQWSxFQUNsQixxQkFBcUIsR0FNckIsTUFBTSxzQkFOZSxFQUNyQixrQkFBa0IsR0FLbEIsTUFBTSxtQkFMWSxFQUNsQixtQkFBbUIsR0FJbkIsTUFBTSxvQkFKYSxFQUNuQixxQkFBcUIsR0FHckIsTUFBTSxzQkFIZSxFQUNyQiwwQkFBMEIsR0FFMUIsTUFBTSwyQkFGb0IsRUFDMUIsdUJBQXVCLEdBQ3ZCLE1BQU0sd0JBRGlCLENBQ2hCO1FBRVgsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzdDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7UUFDN0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLG1CQUFtQixDQUFDO1FBQy9DLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztRQUNuRCxJQUFJLENBQUMsMEJBQTBCLEdBQUcsMEJBQTBCLENBQUM7UUFDN0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFRTSw0Q0FBTyxHQUFkLFVBQWUsZUFBeUI7UUFDcEMsSUFBSSxDQUFD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