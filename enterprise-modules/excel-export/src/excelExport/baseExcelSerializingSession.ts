import {
    Column,
    ColumnGroup,
    ColumnWidthCallbackParams,
    RowHeightCallbackParams,
    Constants,
    ExcelCell,
    ExcelColumn,
    ExcelData,
    ExcelHeaderFooterConfig,
    ExcelImage,
    ExcelRow,
    ExcelSheetMargin,
    ExcelSheetPageSetup,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    _
} from "@ag-grid-community/core";

import {
    BaseGridSerializingSession,
    GridSerializingParams,
    RowAccumulator,
    RowSpanningAccumulator,
    RowType
} from "@ag-grid-community/csv-export";
import { getHeightFromProperty } from "./assets/excelUtils";

export interface StyleLinkerInterface {
    rowType: RowType;
    rowIndex: number;
    value: string;
    column?: Column;
    columnGroup?: ColumnGroup;
    node?: RowNode;
}

export interface ExcelGridSerializingParams extends GridSerializingParams {
    autoConvertFormulas?: boolean;
    baseExcelStyles: ExcelStyle[];
    columnWidth?: number | ((params: ColumnWidthCallbackParams) => number);
    headerFooterConfig?: ExcelHeaderFooterConfig;
    headerRowHeight?: number | ((params: RowHeightCallbackParams) => number);
    rowHeight?: number | ((params: RowHeightCallbackParams) => number);
    margins?: ExcelSheetMargin;
    pageSetup?: ExcelSheetPageSetup;
    sheetName: string;
    styleLinker: (params: StyleLinkerInterface) => string[];
    addImageToCell?: (rowIndex: number, column: Column, value: string) => { image: ExcelImage, value?: string } | undefined;
    suppressTextAsCDATA?: boolean;
}

interface ExcelMixedStyle {
    key: string;
    excelID: string;
    result: ExcelStyle;
}

export abstract class BaseExcelSerializingSession<T> extends BaseGridSerializingSession<ExcelRow[]> {
    protected readonly config: ExcelGridSerializingParams;
    protected readonly stylesByIds: { [key: string]: ExcelStyle };

    protected mixedStyles: { [key: string]: ExcelMixedStyle } = {};
    protected mixedStyleCounter: number = 0;

    protected readonly excelStyles: ExcelStyle[];

    protected rows: ExcelRow[] = [];
    protected cols: ExcelColumn[];
    protected columnsToExport: Column[];

    constructor(config: ExcelGridSerializingParams) {
        super(config);
        this.config = Object.assign({}, config);
        this.stylesByIds = {};
        this.config.baseExcelStyles.forEach(style => {
            this.stylesByIds[style.id] = style;
        });
        this.excelStyles = [...this.config.baseExcelStyles];
    }

    protected abstract createExcel(data: ExcelWorksheet): string;
    protected abstract getDataTypeForValue(valueForCell?: string): T;
    protected abstract getType(type: T, style: ExcelStyle | null, value: string | null): T | null;
    protected abstract createCell(styleId: string | null, type: T, value: string): ExcelCell;
    protected abstract addImage(rowIndex: number, column: Column, value: string): { image: ExcelImage, value?: string } | undefined;
    protected abstract createMergedCell(styleId: string | null, type: T, value: string, numOfCells: number): ExcelCell;

    public addCustomContent(customContent: ExcelRow[]): void {
        customContent.forEach(row => {
            const rowLen = this.rows.length + 1;

            const rowObj: ExcelRow = {
                height: getHeightFromProperty(rowLen, row.height || this.config.rowHeight),
                cells: (row.cells || []).map((cell, idx) => {
                    const image = this.addImage(rowLen, this.columnsToExport[idx], cell.data?.value as string);
                    const ret = { ...cell };

                    if (image) {
                        ret.data = {} as ExcelData;
                        if (image.value != null) {
                            ret.data.value = image.value;
                        } else {
                            ret.data.type = 'e';
                            ret.data.value = null;
                        }
                    }
                    return ret;
                }),
                outlineLevel: row.outlineLevel || undefined
            };

            if (row.collapsed != null) { rowObj.collapsed = row.collapsed; }
            if (row.hidden != null) { rowObj.hidden = row.hidden; }

            this.rows.push(rowObj);
        });
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: (columnGroup: ColumnGroup, header: string, index: number, span: number, collapsibleRanges: number[][]) => {
                const styleIds: string[] = this.config.styleLinker({ rowType: RowType.HEADER_GROUPING, rowIndex: 1, value: `grouping-${header}`, columnGroup });
                currentCells.push({
                    ...this.createMergedCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), header, span),
                    collapsibleRanges
                });
            }
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    }

    public onNewBodyRow(): RowAccumulator {
        return this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
    }

    public prepare(columnsToExport: Column[]): void {
        super.prepare(columnsToExport);
        this.columnsToExport = [...columnsToExport];
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }

    public parse(): string {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }

        const data: ExcelWorksheet = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };

        return this.createExcel(data);
    }

    protected isFormula(value: string | null) {
        if (value == null) { return false; }
        return this.config.autoConvertFormulas && value.toString().startsWith('=');
    }

    protected getStyleById(styleId?: string | null): ExcelStyle | null {
        if (styleId == null) { return null; }
        return this.stylesByIds[styleId] || null;
    }

    private convertColumnToExcel(column: Column | null, index: number): ExcelColumn {
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

    private onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker({ rowType: RowType.HEADER, rowIndex, value: nameForCol, column });
            currentCells.push(this.createCell(this.getStyleId(styleIds), this.getDataTypeForValue('string'), nameForCol));
        };
    }

    private onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node: RowNode) => void, height?: number | ((params: RowHeightCallbackParams) => number)): RowAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height)
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }

    private onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        let skipCols = 0;
        return (column, index, node) => {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }
            if (!this.config.gridOptionsWrapper.isGroupHideOpenParents() && node.level) {
                _.last(this.rows).outlineLevel = node.level;
            }
            const valueForCell = this.extractRowCellValue(column, index, rowIndex, Constants.EXPORT_TYPE_EXCEL, node);
            const styleIds: string[] = this.config.styleLinker({ rowType: RowType.BODY, rowIndex, value: valueForCell, column, node });
            const excelStyleId: string | null = this.getStyleId(styleIds);
            const colSpan = column.getColSpan(node);
            const addedImage = this.addImage(rowIndex, column, valueForCell);

            if (addedImage) {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(addedImage.value), addedImage.value == null ? '' : addedImage.value));
            } else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(this.createMergedCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
            } else {
                currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell));
            }
        };
    }

    private getStyleId(styleIds?: string[] | null): string | null {
        if (!styleIds || !styleIds.length) { return null; }
        if (styleIds.length === 1) { return styleIds[0]; }

        const key: string = styleIds.join("-");
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(styleIds);
        }
        return this.mixedStyles[key].excelID;
    }

    private addNewMixedStyle(styleIds: string[]): void {
        this.mixedStyleCounter += 1;
        const excelId = `mixedStyle${this.mixedStyleCounter}`;
        const resultantStyle: ExcelStyle = {} as ExcelStyle;

        styleIds.forEach((styleId: string) => {
            this.excelStyles.forEach((excelStyle: ExcelStyle) => {
                if (excelStyle.id === styleId) {
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
                }
            });
        });

        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        const key: string = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }
}