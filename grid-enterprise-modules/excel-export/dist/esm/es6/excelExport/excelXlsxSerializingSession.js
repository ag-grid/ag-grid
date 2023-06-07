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