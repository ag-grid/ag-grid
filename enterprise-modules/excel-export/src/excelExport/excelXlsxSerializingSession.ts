import {
    Column,
    ExcelCell,
    ExcelOOXMLDataType,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    _
} from '@ag-grid-community/core';

import { RowSpanningAccumulator, RowType } from "@ag-grid-community/csv-export";
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';

export class ExcelXlsxSerializingSession extends BaseExcelSerializingSession<ExcelOOXMLDataType> {

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
                currentCells.push(this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : null, 's', header, span));
            }
        };
    }

    protected createExcel(data: ExcelWorksheet[]): string {
        return ExcelXlsxFactory.createExcel(this.excelStyles, data, this.stringList);
    }

    protected getDataTypeForValue(valueForCell: string): ExcelOOXMLDataType {
        return _.isNumeric(valueForCell) ? 'n' : 's';
    }

    protected onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node?: RowNode) => void {
        return (column: Column, index: number, node?: RowNode) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : null, 's', nameForCol));
        };
    }

    protected getType(type: ExcelOOXMLDataType, style: ExcelStyle | null, value: string | null): ExcelOOXMLDataType | null {
        if (this.isFormula(value)) { return 'f'; }

        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'formula':
                    return 'f';
                case 'string':
                    return 's';
                case 'number':
                    return 'n';
                case 'datetime':
                    return 'd';
                case 'error':
                    return 'e';
                case 'boolean':
                    return 'b';
                default:
                    console.warn(`ag-grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }

        return type;
    }

    protected createCell(styleId: string | null, type: ExcelOOXMLDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle | null = this.getStyleById(styleId);
        const typeTransformed = this.getType(type, actualStyle, value) || type;;

        return {
            styleId: actualStyle ? styleId! : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    }

    protected createMergedCell(styleId: string | null, type: ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId! : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }

    private getStringPosition(val: string): number {
        let pos: number | undefined = this.stringMap[val];

        if (pos === undefined) {
            pos = this.stringMap[val] = this.stringList.length;
            this.stringList.push(val);
        }

        return pos;
    }

    private getCellValue(type: ExcelOOXMLDataType, value: string | null): string | null {
        if (value == null) { return this.getStringPosition('').toString(); }

        switch (type) {
            case 's':
                return this.getStringPosition(value).toString();
            case 'f':
                return value.slice(1);
            case 'n':
                return Number(value).toString();
            default: 
                return value;
        }
    }
}
