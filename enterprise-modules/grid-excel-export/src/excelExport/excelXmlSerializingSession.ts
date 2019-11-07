import {
    Column,
    Constants,
    ExcelCell,
    ExcelColumn,
    ExcelDataType,
    ExcelOOXMLDataType,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    _
} from '@ag-community/grid-core';

import { ExcelMixedStyle } from './excelCreator';
import { ExcelXmlFactory } from './excelXmlFactory';
import { ExcelXlsxFactory } from './excelXlsxFactory';
import {GridSerializingParams, RowType, BaseGridSerializingSession, RowAccumulator, RowSpanningAccumulator} from "@ag-community/grid-csv-export";

export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName: string;
    excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    suppressTextAsCDATA?: boolean;
    rowHeight?: number;
    headerRowHeight?: number;
    columnWidth?: number | ((column: Column | null, index: number) => number);
}

export class ExcelXmlSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    protected stylesByIds: any | undefined;
    protected mixedStyles: { [key: string]: ExcelMixedStyle } = {};
    protected mixedStyleCounter: number = 0;
    protected excelStyles: ExcelStyle[];
    protected rowHeight: number | undefined;
    protected headerRowHeight: number | undefined;

    protected rows: ExcelRow[] = [];
    protected cols: ExcelColumn[];

    protected config: ExcelGridSerializingParams;

    constructor(config: ExcelGridSerializingParams) {
        super(config);
        this.config = _.assign({}, config);
        this.stylesByIds = {};
        this.config.baseExcelStyles.forEach(style => {
            this.stylesByIds[style.id] = style;
        });
        this.excelStyles = [...this.config.baseExcelStyles];
    }

    public addCustomContent(customContent: ExcelCell[][]): void {
        customContent.forEach(cells => this.rows.push({cells}));
    }

    public prepare(columnsToExport: Column[]): void {
        super.prepare(columnsToExport);
        this.cols = columnsToExport.map((col, i) => this.convertColumnToExcel(col, i));
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height: this.headerRowHeight
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                const styleIds: string[] = this.config.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, "String", header, span));
            }
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        return this.onNewRow(this.onNewHeaderColumn, this.headerRowHeight);
    }

    public onNewBodyRow(): RowAccumulator {
        return this.onNewRow(this.onNewBodyColumn, this.rowHeight);
    }

    onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node: RowNode) => void, height?: number): RowAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }

    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 'String', nameForCol));
        };
    }

    public parse(): string {
        // adding custom content might have made some rows wider than the grid, so add new columns
        const longestRow = this.rows.reduce((a, b) => Math.max(a, b.cells.length), 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }

        const data: ExcelWorksheet [] = [{
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        }];

        return this.createExcel(data);
    }

    protected createExcel(data: ExcelWorksheet[]) {
        return this.config.excelFactory.createExcel(this.excelStyles, data, []);
    }

    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        return (column, index, node) => {
            const valueForCell = this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_EXCEL, node);
            const styleIds: string[] = this.config.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
            let excelStyleId: string | undefined;
            if (styleIds && styleIds.length == 1) {
                excelStyleId = styleIds [0];
            } else if (styleIds && styleIds.length > 1) {
                const key: string = styleIds.join("-");
                if (!this.mixedStyles[key]) {
                    this.addNewMixedStyle(styleIds);
                }
                excelStyleId = this.mixedStyles[key].excelID;
            }
            currentCells.push(this.createCell(excelStyleId, this.getDataTypeForValue(valueForCell), valueForCell));
        };
    }

    protected getDataTypeForValue(valueForCell: any): ExcelOOXMLDataType | ExcelDataType {
        return _.isNumeric(valueForCell) ? 'Number' : 'String';
    }

    addNewMixedStyle(styleIds: string[]): void {
        this.mixedStyleCounter += 1;
        const excelId = 'mixedStyle' + this.mixedStyleCounter;
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

    protected styleExists(styleId?: string): boolean {
        if (styleId == null) { return false; }

        return this.stylesByIds[styleId];
    }

    protected createCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle = styleId && this.stylesByIds[styleId];
        const styleExists: boolean = actualStyle !== undefined;

        function getType(): ExcelDataType {
            if (
                styleExists &&
                actualStyle.dataType
            ) { switch (actualStyle.dataType) {
                case 'string':
                    return 'String';
                case 'number':
                    return 'Number';
                case 'dateTime':
                    return 'DateTime';
                case 'error':
                    return 'Error';
                case 'boolean':
                    return 'Boolean';
                default:
                    console.warn(`ag-grid: Unrecognized data type for excel export [${actualStyle.id}.dataType=${actualStyle.dataType}]`);
            }
            }

            return type as ExcelDataType;
        }

        const typeTransformed: ExcelDataType = getType();

        const massageText = (val: string) => {
            if (this.config.suppressTextAsCDATA) {
                return _.escape(val);
            }
            const cdataStart = '<![CDATA[';
            const cdataEnd = ']]>';
            const cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        }
        const convertBoolean = (val: boolean | string): string => {
            if (!val || val === '0' || val === 'false') { return '0'; }
            return '1';
        };

        return {
            styleId: styleExists ? styleId : undefined,
            data: {
                type: typeTransformed,
                value:
                    typeTransformed === 'String' ? massageText(value) :
                        typeTransformed === 'Number' ? Number(value).valueOf() + '' :
                            typeTransformed === 'Boolean' ? convertBoolean(value) :
                                value
            }
        };
    }

    protected createMergedCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell {
        return {
            styleId: this.styleExists(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }

    private convertColumnToExcel(column: Column | null, index: number): ExcelColumn {
        const columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            } else {
                return { width: columnWidth(column, index) };
            }
        }
        if (column) {
            return { width: column.getActualWidth() };
        }
        return {};
    }
}