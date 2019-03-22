import {
    BaseGridSerializingSession,
    Column,
    Constants,
    ExcelCell,
    ExcelColumn,
    ExcelDataType,
    ExcelOOXMLDataType,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
    GridSerializingParams,
    RowAccumulator,
    RowNode,
    RowSpanningAccumulator,
    RowType,
    _
} from 'ag-grid-community';

import { ExcelMixedStyle } from './excelCreator';
import { ExcelXmlFactory } from './excelXmlFactory';
import { ExcelXlsxFactory } from './excelXlsxFactory';

export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName: string;
    excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];
    suppressTextAsCDATA: boolean;
    rowHeight?: number;
    headerRowHeight?: number;
}

export class ExcelXmlSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    protected stylesByIds: any | undefined;
    protected mixedStyles: { [key: string]: ExcelMixedStyle } = {};
    protected mixedStyleCounter: number = 0;
    protected excelStyles: ExcelStyle[];
    protected customHeader: ExcelCell[][];
    protected customFooter: ExcelCell[][];
    protected sheetName: string;
    protected suppressTextAsCDATA: boolean;
    protected rowHeight: number | undefined;
    protected headerRowHeight: number | undefined;

    protected rows: ExcelRow[] = [];
    protected cols: ExcelColumn[];

    protected excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    protected styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column?: Column, node?: RowNode) => string[];

    constructor(config: ExcelGridSerializingParams) {
        super({
            columnController: config.columnController,
            valueService: config.valueService,
            gridOptionsWrapper: config.gridOptionsWrapper,
            processCellCallback: config.processCellCallback,
            processHeaderCallback: config.processHeaderCallback,
            cellAndHeaderEscaper: (raw: string) => raw
        });

        const {sheetName, excelFactory, baseExcelStyles, styleLinker, suppressTextAsCDATA, rowHeight, headerRowHeight} = config;

        this.sheetName = sheetName;
        this.excelFactory = excelFactory;
        this.baseExcelStyles = baseExcelStyles || [];
        this.styleLinker = styleLinker;
        this.suppressTextAsCDATA = suppressTextAsCDATA;
        this.stylesByIds = {};
        this.rowHeight = rowHeight;
        this.headerRowHeight = headerRowHeight;

        this.baseExcelStyles.forEach((it: ExcelStyle) => {
            this.stylesByIds[it.id] = it;
        });
        this.excelStyles = [...this.baseExcelStyles];
    }

    public addCustomHeader(customHeader: ExcelCell[][]): void {
        this.customHeader = customHeader;
    }

    public addCustomFooter(customFooter: ExcelCell[][]): void {
        this.customFooter = customFooter;
    }

    public prepare(columnsToExport: Column[]): void {
        this.cols = _.map(columnsToExport, (it: Column) => {
            // tslint:disable-next-line
            it.getColDef().cellStyle;
            return {
                width: it.getActualWidth()
            } as ExcelColumn;
        });
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        const that = this;
        this.rows.push({
            cells: currentCells,
            height: this.headerRowHeight
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                const styleIds: string[] = that.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(that.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, "String", header, span));
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
        const that = this;
        return (column: Column, index: number, node: RowNode) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = that.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 'String', nameForCol));
        };
    }

    public parse(): string {
        function join(header: ExcelCell[][], body: ExcelRow[], footer: ExcelCell[][]): ExcelRow[] {
            const all: ExcelRow[] = [];
            if (header) {
                header.forEach(rowArray => all.push({cells: rowArray}));
            }
            body.forEach(it => all.push(it));
            if (footer) {
                footer.forEach(rowArray => all.push({cells: rowArray}));
            }
            return all;
        }

        const data: ExcelWorksheet [] = [{
            name: this.sheetName,
            table: {
                columns: this.cols,
                rows: join(this.customHeader, this.rows, this.customFooter)
            }
        }];

        return this.excelFactory.createExcel(this.excelStyles, data, []);
    }

    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        const that = this;
        return (column: Column, index: number, node: RowNode) => {
            const valueForCell = this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_EXCEL, node);
            const styleIds: string[] = that.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
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
            const type: ExcelDataType = _.isNumeric(valueForCell) ? 'Number' : 'String';
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
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

        const massageText = (val: string) => this.suppressTextAsCDATA ? _.escape(val) : `<![CDATA[${val}]]>`;
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
}
