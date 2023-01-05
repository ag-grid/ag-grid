import {
    ExcelCell,
    ExcelStyle,
    ExcelDataType,
    ExcelWorksheet,
    _
} from '@ag-grid-community/core';

import { ExcelXmlFactory } from './excelXmlFactory';

import { BaseExcelSerializingSession } from './baseExcelSerializingSession';

export class ExcelXmlSerializingSession extends BaseExcelSerializingSession<ExcelDataType> {

    protected createExcel(data: ExcelWorksheet): string {
        return ExcelXmlFactory.createExcel(this.excelStyles, data);
    }

    protected getDataTypeForValue(valueForCell?: string): ExcelDataType {
        return this.isNumerical(valueForCell) ? 'Number' : 'String';
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
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }

        return type;
    }

    protected addImage(): undefined {
        return;
    }

    protected createCell(styleId: string | null, type: ExcelDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle | null = this.getStyleById(styleId);
        const typeTransformed = (this.getType(type, actualStyle, value) || type);

        return {
            styleId: !!actualStyle ? styleId! : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    }

    private getValueTransformed(typeTransformed: ExcelDataType, value: string): string {
        const wrapText = (val: string): string => {
            if (this.config.suppressTextAsCDATA) {
                return _.escapeString(val) as string;
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

        switch (typeTransformed) {
            case 'String':
                return wrapText(value);
            case 'Number':
                return Number(value).valueOf() + '';
            case 'Boolean':
                return convertBoolean(value);
            default:
                return value;
        }
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