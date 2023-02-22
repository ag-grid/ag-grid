import {
    Column,
    ExcelCell,
    ExcelImage,
    ExcelOOXMLDataType,
    ExcelStyle,
    ExcelWorksheet,
} from '@ag-grid-community/core';

import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';

export class ExcelXlsxSerializingSession extends BaseExcelSerializingSession<ExcelOOXMLDataType> {

    protected createExcel(data: ExcelWorksheet): string {
        const { excelStyles, config } = this;
        const { margins, pageSetup, headerFooterConfig } = config;

        return ExcelXlsxFactory.createExcel(
            excelStyles,
            data,
            margins,
            pageSetup,
            headerFooterConfig
        );
    }

    protected getDataTypeForValue(valueForCell?: string): ExcelOOXMLDataType {
        if (valueForCell === undefined) { return 'empty'; }
        return this.isNumerical(valueForCell) ? 'n' : 's';
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
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }

        return type;
    }

    protected addImage(rowIndex: number, column: Column, value: string): { image: ExcelImage, value?: string } | undefined {
        if (!this.config.addImageToCell) { return; }

        const addedImage = this.config.addImageToCell(rowIndex, column, value);

        if (!addedImage) { return; }

        ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);

        return addedImage;
    }

    protected createCell(styleId: string | null, type: ExcelOOXMLDataType, value: string): ExcelCell {
        const actualStyle: ExcelStyle | null = this.getStyleById(styleId);
        const typeTransformed = this.getType(type, actualStyle, value) || type;

        return {
            styleId: actualStyle ? styleId! : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    }

    protected createMergedCell(styleId: string | null, type: ExcelOOXMLDataType, value: string, numOfCells: number): ExcelCell {
        const valueToUse = value == null ? '' : value;
        return {
            styleId: !!this.getStyleById(styleId) ? styleId! : undefined,
            data: {
                type: type,
                value: type === 's' ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    }

    private getCellValue(type: ExcelOOXMLDataType, value: string | null): string | null {
        if (value == null) { return ExcelXlsxFactory.getStringPosition('').toString(); }

        switch (type) {
            case 's':
                return value === '' ? '' : ExcelXlsxFactory.getStringPosition(value).toString();
            case 'f':
                return value.slice(1);
            case 'n':
                return Number(value).toString();
            default:
                return value;
        }
    }
}
