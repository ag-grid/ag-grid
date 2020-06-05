import {
    Column,
    ExcelCell,
    ExcelDataType,
    ExcelOOXMLDataType,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    _
} from '@ag-grid-community/core';

import { ExcelXmlSerializingSession } from './excelXmlSerializingSession';
import { RowSpanningAccumulator, RowType } from "@ag-grid-community/csv-export";

export class ExcelXlsxSerializingSession extends ExcelXmlSerializingSession {

    private stringList: string[] = [];
    private stringMap: {[key: string]: number} = {};

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];

        this.rows.push({
            cells: currentCells,
            height: this.config.headerRowHeight
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                const styleIds: string[] = this.config.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', header, span));
            }
        };
    }

    onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        return (column: Column, index: number, node?: RowNode) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : undefined, 's', nameForCol));
        };
    }

    protected createExcel(data: ExcelWorksheet[]) {
        return this.config.excelFactory.createExcel(this.excelStyles, data, this.stringList);
    }

    protected getDataTypeForValue(valueForCell: any): ExcelOOXMLDataType | ExcelDataType {
        return _.isNumeric(valueForCell) ? 'n' : 's';
    }

    private getStringPosition(val: string): number {
        let pos: number | undefined = this.stringMap[val];

        if (pos === undefined) {
            pos = this.stringMap[val] = this.stringList.length;
            this.stringList.push(val);
        }

        return pos;
    }

    protected createCell(styleId: string | undefined, type: ExcelOOXMLDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle = styleId && this.stylesByIds[styleId];
        const styleExists: boolean = actualStyle !== undefined;

        function getType(): ExcelOOXMLDataType {
            if (
                styleExists &&
                actualStyle.dataType
            ) { switch (actualStyle.dataType) {
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
            }

            return type;
        }

        const typeTransformed: ExcelOOXMLDataType = getType();

        return {
            styleId: styleExists ? styleId : undefined,
            data: {
                type: typeTransformed,
                value:
                    typeTransformed === 's'
                    ? this.getStringPosition(value == null ? '' : value).toString()
                    : typeTransformed === 'n'
                        ? Number(value).toString()
                        : value
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
