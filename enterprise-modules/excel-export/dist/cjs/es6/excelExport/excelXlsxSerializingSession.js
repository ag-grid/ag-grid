"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const excelXlsxFactory_1 = require("./excelXlsxFactory");
const baseExcelSerializingSession_1 = require("./baseExcelSerializingSession");
class ExcelXlsxSerializingSession extends baseExcelSerializingSession_1.BaseExcelSerializingSession {
    createExcel(data) {
        const { excelStyles, config } = this;
        const { margins, pageSetup, headerFooterConfig } = config;
        return excelXlsxFactory_1.ExcelXlsxFactory.createExcel(excelStyles, data, margins, pageSetup, headerFooterConfig);
    }
    getDataTypeForValue(valueForCell) {
        if (valueForCell === undefined) {
            return 'empty';
        }
        return core_1._.isNumeric(valueForCell) ? 'n' : 's';
    }
    getType(type, style, value) {
        if (this.isFormula(value)) {
            return 'f';
        }
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
    addImage(rowIndex, column, value) {
        if (!this.config.addImageToCell) {
            return;
        }
        const addedImage = this.config.addImageToCell(rowIndex, column, value);
        if (!addedImage) {
            return;
        }
        excelXlsxFactory_1.ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
        return addedImage;
    }
    createCell(styleId, type, value) {
        const actualStyle = this.getStyleById(styleId);
        const typeTransformed = this.getType(type, actualStyle, value) || type;
        return {
            styleId: actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    }
    createMergedCell(styleId, type, value, numOfCells) {
        const valueToUse = value == null ? '' : value;
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? excelXlsxFactory_1.ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    }
    getCellValue(type, value) {
        if (value == null) {
            return excelXlsxFactory_1.ExcelXlsxFactory.getStringPosition('').toString();
        }
        switch (type) {
            case 's':
                return value === '' ? '' : excelXlsxFactory_1.ExcelXlsxFactory.getStringPosition(value).toString();
            case 'f':
                return value.slice(1);
            case 'n':
                return Number(value).toString();
            default:
                return value;
        }
    }
}
exports.ExcelXlsxSerializingSession = ExcelXlsxSerializingSession;
