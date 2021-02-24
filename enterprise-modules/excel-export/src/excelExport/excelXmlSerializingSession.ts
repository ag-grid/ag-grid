import {
    Column,
    ExcelCell,
    ExcelDataType,
    ExcelStyle,
    ExcelWorksheet,
    RowNode,
    _
} from '@ag-grid-community/core';

import { ExcelXmlFactory } from './excelXmlFactory';
import { RowType, RowSpanningAccumulator } from "@ag-grid-community/csv-export";
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';

export class ExcelXmlSerializingSession extends BaseExcelSerializingSession<ExcelDataType> {

    public onNewHeaderGroupingRow(): RowSpanningAccumulator {
        const currentCells: ExcelCell[] = [];
        this.rows.push({
            cells: currentCells,
            height: this.config.headerRowHeight
        });
        return {
            onColumn: (header: string, index: number, span: number) => {
                const styleIds: string[] = this.config.styleLinker(RowType.HEADER_GROUPING, 1, index, "grouping-" + header, undefined, undefined);
                currentCells.push(this.createMergedCell((styleIds && styleIds.length > 0) ? styleIds[0] : null, "String", header, span));
            }
        };
    }

    protected createExcel(data: ExcelWorksheet): string {
        return ExcelXmlFactory.createExcel(this.excelStyles, data, []);
    }

    protected getDataTypeForValue(valueForCell: string): ExcelDataType {
        return _.isNumeric(valueForCell) ? 'Number' : 'String';
    }

    protected onNewHeaderColumn(rowIndex: number, currentCells: ExcelCell[]): (column: Column, index: number, node: RowNode) => void {
        return (column, index) => {
            const nameForCol = this.extractHeaderValue(column);
            const styleIds: string[] = this.config.styleLinker(RowType.HEADER, rowIndex, index, nameForCol, column, undefined);
            currentCells.push(this.createCell((styleIds && styleIds.length > 0) ? styleIds[0] : null, 'String', nameForCol));
        };
    }

    protected getType(type: ExcelDataType, style: ExcelStyle | null, value: string | null): ExcelDataType | null {
        if (this.isFormula(value)) { return 'Formula'; }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'string':
                    return 'Formula';
                case 'number':
                    return 'Number';
                case 'datetime':
                    return 'DateTime';
                case 'error':
                    return 'Error';
                case 'boolean':
                    return 'Boolean';
                default:
                    console.warn(`ag-grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }

        return type;
    }

    protected createCell(styleId: string | null, type: ExcelDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle | null = this.getStyleById(styleId);
        const typeTransformed = (this.getType(type, actualStyle, value) || type) as ExcelDataType;

        const massageText = (val: string) => {
            if (this.config.suppressTextAsCDATA) {
                return _.escapeString(val);
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
        };
        const convertBoolean = (val: boolean | string): string => {
            if (!val || val === '0' || val === 'false') { return '0'; }
            return '1';
        };

        return {
            styleId: !!actualStyle ? styleId! : undefined,
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

    protected createMergedCell(styleId: string | null, type: ExcelDataType, value: string, numOfCells: number): ExcelCell {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId! : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}