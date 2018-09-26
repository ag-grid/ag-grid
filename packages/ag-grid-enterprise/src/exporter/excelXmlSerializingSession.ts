import {
    BaseGridSerializingSession,
    Column,
    Constants,
    GridSerializingParams,
    RowAccumulator,
    RowNode,
    RowSpanningAccumulator,
    RowType,
    Utils,
    _,
    ExcelOOXMLDataType
} from 'ag-grid-community';

import {
    ExcelCell,
    ExcelColumn,
    ExcelDataType,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
} from 'ag-grid-community';

import {ExcelMixedStyle} from './excelCreator';
import {ExcelXmlFactory} from './excelXmlFactory';
import {ExcelXlsxFactory} from './excelXlsxFactory';

export interface ExcelGridSerializingParams extends GridSerializingParams {
    sheetName:string;
    excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode) => string[];
    suppressTextAsCDATA: boolean;
}

export class ExcelXmlSerializingSession extends BaseGridSerializingSession<ExcelCell[][]> {
    protected stylesByIds: any;
    protected mixedStyles: { [key: string]: ExcelMixedStyle } = {};
    protected mixedStyleCounter: number = 0;
    protected excelStyles: ExcelStyle[];
    protected customHeader: ExcelCell[][];
    protected customFooter: ExcelCell[][];
    protected sheetName:string;
    protected suppressTextAsCDATA:boolean;

    protected rows: ExcelRow[] = [];
    protected cols: ExcelColumn[];

    protected excelFactory: ExcelXmlFactory | ExcelXlsxFactory;
    baseExcelStyles: ExcelStyle[];
    protected styleLinker: (rowType: RowType, rowIndex: number, colIndex: number, value: string, column: Column, node: RowNode) => string[];

    constructor(config: ExcelGridSerializingParams) {
        super({
            columnController: config.columnController,
            valueService: config.valueService,
            gridOptionsWrapper: config.gridOptionsWrapper,
            processCellCallback: config.processCellCallback,
            processHeaderCallback: config.processHeaderCallback,
            cellAndHeaderEscaper: (raw: string) => raw
        });

        const {sheetName, excelFactory, baseExcelStyles, styleLinker, suppressTextAsCDATA} = config;

        this.sheetName = sheetName;
        this.excelFactory = excelFactory;
        this.baseExcelStyles = baseExcelStyles;
        this.styleLinker = styleLinker;
        this.suppressTextAsCDATA = suppressTextAsCDATA;

        this.stylesByIds = {};

        if (!baseExcelStyles) {
            this.excelStyles = [];
        } else {
            baseExcelStyles.forEach((it: ExcelStyle) => {
                this.stylesByIds[it.id] = it;
            });
            this.excelStyles = baseExcelStyles.slice();
        }
    }

    public addCustomHeader(customHeader: ExcelCell[][]): void {
        this.customHeader = customHeader;
    }

    public addCustomFooter(customFooter: ExcelCell[][]): void {
        this.customFooter = customFooter;
    }

    public prepare(columnsToExport: Column[]): void {
        this.cols = Utils.map(columnsToExport, (it: Column) => {
            it.getColDef().cellStyle;
            return {
                width: it.getActualWidth()
            };
        });
    }

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        let currentCells: ExcelCell[] = [];
        let that = this;
        this.rows.push({
            cells: currentCells
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                let styleIds: string[] = that.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, null, null);
                currentCells.push(that.createMergedCell(styleIds.length > 0 ? styleIds[0] : null, "String", header, span));
            }
        };
    }

    public onNewHeaderRow(): RowAccumulator {
        return this.onNewRow(this.onNewHeaderColumn);
    }

    public onNewBodyRow(): RowAccumulator {
        return this.onNewRow(this.onNewBodyColumn);
    }

    onNewRow(onNewColumnAccumulator: (rowIndex: number, currentCells: ExcelCell[]) => (column: Column, index: number, node?: RowNode) => void): RowAccumulator {
        let currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    }

    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        let that = this;
        return (column: Column, index: number, node?: RowNode) => {
            let nameForCol = this.extractHeaderValue(column);
            let styleIds: string[] = that.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, null);
            currentCells.push(this.createCell(styleIds.length > 0 ? styleIds[0] : null, 'String', nameForCol));
        };
    }

    public parse(): string {
        function join(header: ExcelCell[][], body: ExcelRow[], footer: ExcelCell[][]): ExcelRow[] {
            let all: ExcelRow[] = [];
            if (header) {
                header.forEach(rowArray => all.push({cells: rowArray}));
            }
            body.forEach(it => all.push(it));
            if (footer) {
                footer.forEach(rowArray => all.push({cells: rowArray}));
            }
            return all;
        }

        let data: ExcelWorksheet [] = [{
            name: this.sheetName,
            table: {
                columns: this.cols,
                rows: join(this.customHeader, this.rows, this.customFooter)
            }
        }];

        return this.excelFactory.createExcel(this.excelStyles, data, []);
    }

    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        let that = this;
        return (column: Column, index: number, node?: RowNode) => {
            let valueForCell = this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_EXCEL, node);
            let styleIds: string[] = that.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
            let excelStyleId: string = null;
            if (styleIds && styleIds.length == 1) {
                excelStyleId = styleIds [0];
            } else if (styleIds && styleIds.length > 1) {
                let key: string = styleIds.join("-");
                if (!this.mixedStyles[key]) {
                    this.addNewMixedStyle(styleIds);
                }
                excelStyleId = this.mixedStyles[key].excelID;
            }
            let type: ExcelDataType = Utils.isNumeric(valueForCell) ? 'Number' : 'String';
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
    }

    addNewMixedStyle(styleIds: string[]): void {
        this.mixedStyleCounter += 1;
        let excelId = 'mixedStyle' + this.mixedStyleCounter;
        let resultantStyle: ExcelStyle = {};

        styleIds.forEach((styleId: string) => {
            this.excelStyles.forEach((excelStyle: ExcelStyle) => {
                if (excelStyle.id === styleId) {
                    Utils.mergeDeep(resultantStyle, excelStyle);
                }
            });
        });

        resultantStyle['id'] = excelId;
        resultantStyle['name'] = excelId;
        let key: string = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    }

    protected styleExists(styleId: string): boolean {
        if (styleId == null) return false;

        return this.stylesByIds[styleId];
    }

    protected createCell(styleId: string, type: ExcelDataType | ExcelOOXMLDataType, value: string): ExcelCell {
        let actualStyle: ExcelStyle = this.stylesByIds[styleId];
        let styleExists: boolean = actualStyle != null;

        function getType(): ExcelDataType {
            if (
                styleExists &&
                actualStyle.dataType
            ) switch (actualStyle.dataType) {
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

            return type as ExcelDataType;
        }

        let typeTransformed: ExcelDataType = getType();

        let massageText = (val:string) =>  this.suppressTextAsCDATA ? _.escape(val) : `<![CDATA[${val}]]>`;

        return {
            styleId: styleExists ? styleId : null,
            data: {
                type: typeTransformed,
                value:
                    typeTransformed === 'String' ? massageText(value):
                    typeTransformed === 'Number' ? Number(value).valueOf() + '' :
                    value
            }
        };
    }

    protected createMergedCell(styleId: string, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell {
        return {
            styleId: this.styleExists(styleId) ? styleId : null,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}