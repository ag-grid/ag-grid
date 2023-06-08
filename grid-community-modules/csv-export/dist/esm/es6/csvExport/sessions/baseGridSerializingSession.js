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
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents');
        const value = ((!hideOpenParents || node.footer) && this.shouldRenderGroupSummaryCell(node, column, index))
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
        var _a;
        const { accumulatedRowIndex, rowNode, column, value, processCellCallback, type } = params;
        if (processCellCallback) {
            return {
                value: (_a = processCellCallback({
                    accumulatedRowIndex,
                    column: column,
                    node: rowNode,
                    value: value,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context,
                    type: type,
                    parseValue: (valueToParse) => this.valueParserService.parseValue(column, rowNode, valueToParse, this.valueService.getValue(column, rowNode)),
                    formatValue: (valueToFormat) => { var _a; return (_a = this.valueFormatterService.formatValue(column, rowNode, valueToFormat)) !== null && _a !== void 0 ? _a : valueToFormat; }
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUdyaWRTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L3Nlc3Npb25zL2Jhc2VHcmlkU2VyaWFsaXppbmdTZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQSxNQUFNLE9BQWdCLDBCQUEwQjtJQWE1QyxZQUFZLE1BQTZCO1FBRmpDLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBR2hDLE1BQU0sRUFDRixXQUFXLEVBQ1gsWUFBWSxFQUNaLGtCQUFrQixFQUNsQixxQkFBcUIsRUFDckIsa0JBQWtCLEVBQ2xCLG1CQUFtQixFQUNuQixxQkFBcUIsRUFDckIsMEJBQTBCLEVBQzFCLHVCQUF1QixHQUMxQixHQUFHLE1BQU0sQ0FBQztRQUVYLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDbkQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO1FBQzdDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztRQUMvQyxJQUFJLENBQUMscUJBQXFCLEdBQUcscUJBQXFCLENBQUM7UUFDbkQsSUFBSSxDQUFDLDBCQUEwQixHQUFHLDBCQUEwQixDQUFDO1FBQzdELElBQUksQ0FBQyx1QkFBdUIsR0FBRyx1QkFBdUIsQ0FBQztJQUMzRCxDQUFDO0lBUU0sT0FBTyxDQUFDLGVBQXlCO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVNLGtC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