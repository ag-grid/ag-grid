import { _ } from "@ag-grid-community/core";
import { BaseGridSerializingSession, RowType } from "@ag-grid-community/csv-export";
import { getHeightFromProperty } from "./assets/excelUtils";
export class BaseExcelSerializingSession extends BaseGridSerializingSession {
    constructor(config) {
        super(config);
        this.mixedStyles = {};
        this.mixedStyleCounter = 0;
        this.rows = [];
        this.config = Object.assign({}, config);
        this.stylesByIds = {};
        this.config.baseExcelStyles.forEach(style => {
            this.stylesByIds[style.id] = style;
        });
        this.excelStyles = [...this.config.baseExcelStyles];
    }
    addCustomContent(customContent) {
        customContent.forEach(row => {
            const rowLen = this.rows.length + 1;
            let outlineLevel;
            if (!this.config.suppressRowOutline && row.outlineLevel != null) {
                outlineLevel = row.outlineLevel;
            }
            const rowObj = {
                height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
                cells: (row.cells || []).map((cell, idx) => {
                    var _a, _b, _c;
                    const image = this.addImage(rowLen, this.columnsToExport[idx], (_a = cell.data) === null || _a === void 0 ? void 0 : _a.value);
                    let excelStyles = null;
                    if (cell.styleId) {
                        excelStyles = typeof cell.styleId === 'string' ? [cell.styleId] : cell.styleId;
                    }
                    const excelStyleId = this.getStyleId(excelStyles);
                    if (image) {
                        return this.createCell(excelStyleId, this.getDataTypeForValue(image.value), image.value == null ? '' : image.value);
                    }
                    const value = (_c = (_b = cell.data) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '';
                    const type = this.getDataTypeForValue(value);
                    if (cell.mergeAcross) {
                        return this.createMergedCell(excelStyleId, type, value, cell.mergeAcross);
                    }
                    return this.createCell(excelStyleId, type, value);
                }),
                outlineLevel
            };
            if (row.collapsed != null) {
                rowObj.collapsed = row.collapsed;
            }
            if (row.hidden != null) {
                rowObj.hidden = row.hidden;
            }
            this.rows.push(rowObj);
        });
    }
    onNewHeaderGroupingRow() {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: (columnGroup, header, index, span, collapsibleRanges) => {
                const styleIds = this.config.styleLinker({ rowType: RowType.HEADER_GROUPING, rowIndex: 1, value: `grouping-${header}`, columnGroup });
                currentCells.push(Object.assign(Object.assign({}, this.createMergedCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), header, span)), { collapsibleRanges }));
            }
        };
    }
    onNewHeaderRow() {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    }
    onNewBodyRow(node) {
        const rowAccumulator = this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
        if (node) {
            this.addRowOutlineIfNecessary(node);
        }
        return rowAccumulator;
    }
    addRowOutlineIfNecessary(node) {
        const { gridOptionsService, suppressRowOutline, rowGroupExpandState = 'expanded' } = this.config;
        const isGroupHideOpenParents = gridOptionsService.is('groupHideOpenParents');
        if (isGroupHideOpenParents || suppressRowOutline || node.level == null) {
            return;
        }
        const padding = node.footer ? 1 : 0;
        const currentRow = _.last(this.rows);
        currentRow.outlineLevel = node.level + padding;
        if (rowGroupExpandState === 'expanded') {
            return;
        }
        const collapseAll = rowGroupExpandState === 'collapsed';
        if (node.isExpandable()) {
            const isExpanded = !collapseAll && node.expanded;
            currentRow.collapsed = !isExpanded;
        }
        currentRow.hidden =
            // always show the node if there is no parent to be expanded
            !!node.parent &&
                // or if it is a child of the root node
                node.parent.level !== -1 &&
                (collapseAll || this.isAnyParentCollapsed(node.parent));
    }
    isAnyParentCollapsed(node) {
        while (node && node.level !== -1) {
            if (!node.expanded) {
                return true;
            }
            node = node.parent;
        }
        return false;
    }
    prepare(columnsToExport) {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }
    parse() {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        const data = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };
        return this.createExcel(data);
    }
    isFormula(value) {
        if (value == null) {
            return false;
        }
        return this.config.autoConvertFormulas && value.toString().startsWith('=');
    }
    isNumerical(value) {
        if (typeof value === 'bigint') {
            return true;
        }
        return isFinite(value) && value !== '' && !isNaN(parseFloat(value));
    }
    getStyleById(styleId) {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    }
    convertColumnToExcel(column, index) {
        const columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            return { width: columnWidth({ column, index }) };
        }
        if (column) {
            const smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    }
    onNewHeaderColumn(rowIndex, currentCells) {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds = this.config.styleLinker({ rowType: RowType.HEADER, rowIndex, value: nameForCol, column });
            currentCells.push(this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), nameForCol));
        };
    }
    onNewRow(onNewColumnAccumulator, height) {
        const currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height)
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }
    onNewBodyColumn(rowIndex, currentCells) {
        let skipCols = 0;
        return (column, index, node) => {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }
            const valueForCell = this.extractRowCellValue(column, index, rowIndex, 'excel', node);
            const styleIds = this.config.styleLinker({ rowType: RowType.BODY, rowIndex, value: valueForCell, column, node });
            const excelStyleId = this.getStyleId(styleIds);
            const colSpan = column.getColSpan(node);
            const addedImage = this.addImage(rowIndex, column, valueForCell);
            if (addedImage) {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(addedImage.value), addedImage.value == null ? '' : addedImage.value));
            }
            else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(this.createMergedCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
            }
            else {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell));
            }
        };
    }
    getStyleId(styleIds) {
        if (!styleIds || !styleIds.length) {
            return null;
        }
        if (styleIds.length === 1) {
            return styleIds[0];
        }
        const key = styleIds.join("-");
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(styleIds);
        }
        return this.mixedStyles[key].excelID;
    }
    addNewMixedStyle(styleIds) {
        this.mixedStyleCounter += 1;
        const excelId = `mixedStyle${this.mixedStyleCounter}`;
        const resultantStyle = {};
        styleIds.forEach((styleId) => {
            this.excelStyles.forEach((excelStyle) => {
                if (excelStyle.id === styleId) {
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
                }
            });
        });
        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        const key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUV4Y2VsU2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2Jhc2VFeGNlbFNlcmlhbGl6aW5nU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBZUgsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxFQUNILDBCQUEwQixFQUkxQixPQUFPLEVBQ1YsTUFBTSwrQkFBK0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQW1DNUQsTUFBTSxPQUFnQiwyQkFBK0IsU0FBUSwwQkFBc0M7SUFhL0YsWUFBWSxNQUFrQztRQUMxQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFWUixnQkFBVyxHQUF1QyxFQUFFLENBQUM7UUFDckQsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBSTlCLFNBQUksR0FBZSxFQUFFLENBQUM7UUFNNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBU00sZ0JBQWdCLENBQUMsYUFBeUI7UUFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMs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