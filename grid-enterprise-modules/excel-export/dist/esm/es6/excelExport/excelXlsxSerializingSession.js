import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export class ExcelXlsxSerializingSession extends BaseExcelSerializingSession {
    createExcel(data) {
        const { excelStyles, config } = this;
        return ExcelXlsxFactory.createExcel(excelStyles, data, config);
    }
    getDataTypeForValue(valueForCell) {
        if (valueForCell === undefined) {
            return 'empty';
        }
        return this.isNumerical(valueForCell) ? 'n' : 's';
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
        ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
        return addedImage;
    }
    createCell(styleId, type, value, valueFormatted) {
        const actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 's' && valueFormatted) {
            value = valueFormatted;
        }
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
                value: type === 's' ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    }
    getCellValue(type, value) {
        if (value == null) {
            return ExcelXlsxFactory.getStringPosition('').toString();
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbHN4U2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsWGxzeFNlcmlhbGl6aW5nU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RSxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsMkJBQStDO0lBRWxGLFdBQVcsQ0FBQyxJQUFvQjtRQUN0QyxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQyxPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FDL0IsV0FBVyxFQUNYLElBQUksRUFDSixNQUFNLENBQ1QsQ0FBQztJQUNOLENBQUM7SUFFUyxtQkFBbUIsQ0FBQyxZQUFxQjtRQUMvQyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7WUFBRSxPQUFPLE9BQU8sQ0FBQztTQUFFO1FBQ25ELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDdEQsQ0FBQztJQUVTLE9BQU8sQ0FBQyxJQUF3QixFQUFFLEtBQXdCLEVBQUUsS0FBb0I7UUFDdEYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxHQUFHLENBQUM7U0FBRTtRQUUxQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLFNBQVM7b0JBQ1YsT0FBTyxHQUFHLENBQUM7Z0JBQ2YsS0FBSyxRQUFRO29CQUNULE9BQU8sR0FBRyxDQUFDO2dCQUNm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