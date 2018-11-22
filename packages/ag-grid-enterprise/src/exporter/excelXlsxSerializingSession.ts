import {
    Column,
    Constants,
    ExcelCell,
    ExcelDataType,
    ExcelOOXMLDataType,
    ExcelRow,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    RowSpanningAccumulator,
    RowType,
    Utils
} from 'ag-grid-community';

import {ExcelXmlSerializingSession} from './excelXmlSerializingSession';

export class ExcelXlsxSerializingSession extends ExcelXmlSerializingSession {

    private stringList: string[] = [];

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        const that = this;

        this.rows.push({
            cells: currentCells,
            height: this.headerRowHeight
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                let styleIds: string[] = that.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(that.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', header, span));
            }
        };
    }

    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        let that = this;
        return (column: Column, index: number, node?: RowNode) => {
            let nameForCol = this.extractHeaderValue(column);
            let styleIds: string[] = that.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', nameForCol));
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

        return this.excelFactory.createExcel(this.excelStyles, data, this.stringList);
    }

    onNewBodyColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        let that = this;
        return (column: Column, index: number, node?: RowNode) => {
            let valueForCell = this.extractRowCellValue(column, index, Constants.EXPORT_TYPE_EXCEL, node);
            let styleIds: string[] = that.styleLinker(RowType.BODY, rowIndex, index, valueForCell, column, node);
            let excelStyleId: string | undefined;
            if (styleIds && styleIds.length == 1) {
                excelStyleId = styleIds [0];
            } else if (styleIds && styleIds.length > 1) {
                let key: string = styleIds.join("-");
                if (!this.mixedStyles[key]) {
                    this.addNewMixedStyle(styleIds);
                }
                excelStyleId = this.mixedStyles[key].excelID;
            }
            let type: ExcelOOXMLDataType = Utils.isNumeric(valueForCell) ? 'n' : 's';
            currentCells.push(that.createCell(excelStyleId, type, valueForCell));
        };
    }

    private getStringPosition(val: string) {
        const pos = this.stringList.indexOf(val);

        if (pos < 0) {
            this.stringList.push(val);
            return this.stringList.length - 1;
        }

        return pos;
    }

    protected createCell(styleId: string | undefined, type: ExcelOOXMLDataType, value: string): ExcelCell {
        let actualStyle: ExcelStyle = styleId && this.stylesByIds[styleId];
        let styleExists: boolean = actualStyle !== undefined;

        function getType(): ExcelOOXMLDataType {
            if (
                styleExists &&
                actualStyle.dataType
            ) switch (actualStyle.dataType) {
                case 'string':
                    return 's';
                case 'number':
                    return 'n';
                case 'dateTime':
                    return 'd';
                case 'error':
                    return 'e';
                case 'boolean':
                    return 'b';
                default:
                    console.warn(`ag-grid: Unrecognized data type for excel export [${actualStyle.id}.dataType=${actualStyle.dataType}]`);
            }

            return type;
        }

        let typeTransformed: ExcelOOXMLDataType = getType();

        return {
            styleId: styleExists ? styleId : undefined,
            data: {
                type: typeTransformed,
                value:
                    typeTransformed === 's' ? this.getStringPosition(value == null ? '' : value).toString() :
                        typeTransformed === 'n' ? Number(value).toString() :
                            value
            }
        };
    }

    protected createMergedCell(styleId: string | undefined, type: ExcelDataType | ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell {
        return {
            styleId: this.styleExists(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? this.getStringPosition(value == null ? '' : value).toString() : value
            },
            mergeAcross: numOfCells
        };
    }
}