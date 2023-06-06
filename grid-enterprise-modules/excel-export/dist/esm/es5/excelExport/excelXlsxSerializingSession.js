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
    ExcelXlsxSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.getStyleById(styleId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbHN4U2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2V4Y2VsWGxzeFNlcmlhbGl6aW5nU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RTtJQUFpRCwrQ0FBK0M7SUFBaEc7O0lBNkZBLENBQUM7SUEzRmEsaURBQVcsR0FBckIsVUFBc0IsSUFBb0I7UUFDaEMsSUFBQSxLQUEwQixJQUFJLEVBQTVCLFdBQVcsaUJBQUEsRUFBRSxNQUFNLFlBQVMsQ0FBQztRQUVyQyxPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FDL0IsV0FBVyxFQUNYLElBQUksRUFDSixNQUFNLENBQ1QsQ0FBQztJQUNOLENBQUM7SUFFUyx5REFBbUIsR0FBN0IsVUFBOEIsWUFBcUI7UUFDL0MsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO1lBQUUsT0FBTyxPQUFPLENBQUM7U0FBRTtRQUNuRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ3RELENBQUM7SUFFUyw2Q0FBTyxHQUFqQixVQUFrQixJQUF3QixFQUFFLEtBQXdCLEVBQUUsS0FBb0I7UUFDdEYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxHQUFHLENBQUM7U0FBRTtRQUUxQyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLFNBQVM7b0JBQ1YsT0FBTyxHQUFH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