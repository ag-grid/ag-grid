var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ExcelXlsxFactory } from './excelXlsxFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
var ExcelXlsxSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXlsxSerializingSession, _super);
    function ExcelXlsxSerializingSession() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelXlsxSerializingSession.prototype.createExcel = function (data) {
        var _a = this, excelStyles = _a.excelStyles, config = _a.config;
        return ExcelXlsxFactory.createExcel(excelStyles, data, config);
    };
    ExcelXlsxSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        if (valueForCell === undefined) {
            return 'empty';
        }
        return this.isNumerical(valueForCell) ? 'n' : 's';
    };
    ExcelXlsxSerializingSession.prototype.getType = function (type, style, value) {
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
                    console.warn("AG Grid: Unrecognized data type for excel export [" + style.id + ".dataType=" + style.dataType + "]");
            }
        }
        return type;
    };
    ExcelXlsxSerializingSession.prototype.addImage = function (rowIndex, column, value) {
        if (!this.config.addImageToCell) {
            return;
        }
        var addedImage = this.config.addImageToCell(rowIndex, column, value);
        if (!addedImage) {
            return;
        }
        ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
        return addedImage;
    };
    ExcelXlsxSerializingSession.prototype.createCell = function (styleId, type, value, valueFormatted) {
        var actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 's' && valueFormatted) {
            value = valueFormatted;
        }
        var typeTransformed = this.getType(type, actualStyle, value) || type;
        return {
            styleId: actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        var valueToUse = value == null ? '' : value;
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    };
    ExcelXlsxSerializingSession.prototype.getCellValue = function (type, value) {
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
    };
    return ExcelXlsxSerializingSession;
}(BaseExcelSerializingSession));
export { ExcelXlsxSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbHN4U2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsWGxzeFNlcmlhbGl6aW5nU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RTtJQUFpRCwrQ0FBK0M7SUFBaEc7O0lBZ0dBLENBQUM7SUE5RmEsaURBQVcsR0FBckIsVUFBc0IsSUFBb0I7UUFDaEMsSUFBQSxLQUEwQixJQUFJLEVBQTVCLFdBQVcsaUJBQUEsRUFBRSxNQUFNLFlBQVMsQ0FBQztRQUVyQyxPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FDL0IsV0FBVyxFQUNYLElBQUksRUFDSixNQUFNLENBQ1QsQ0FBQztJQUNOLENBQUM7SUFFUyx5REFBbUIsR0FBN0IsVUFBOEIsWUFBcUI7UUFDL0MsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO1lBQUUsT0FBTyxPQUFPLENBQUM7U0FBRTtRQUNuRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3RELENBQUM7SUFFUyw2Q0FBTyxHQUFqQixVQUFrQixJQUF3QixFQUFFLEtBQXdCLEVBQUUsS0FBb0I7UUFDdEYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxHQUFHLENBQUM7U0FBRTtRQUUxQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLFNBQVM7b0JBQ1YsT0FBTyxHQUFH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