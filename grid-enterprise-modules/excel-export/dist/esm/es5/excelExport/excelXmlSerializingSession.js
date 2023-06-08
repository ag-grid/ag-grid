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
import { _ } from '@ag-grid-community/core';
import { ExcelXmlFactory } from './excelXmlFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
var ExcelXmlSerializingSession = /** @class */ (function (_super) {
    __extends(ExcelXmlSerializingSession, _super);
    function ExcelXmlSerializingSession() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelXmlSerializingSession.prototype.createExcel = function (data) {
        return ExcelXmlFactory.createExcel(this.excelStyles, data);
    };
    ExcelXmlSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        return this.isNumerical(valueForCell) ? 'Number' : 'String';
    };
    ExcelXmlSerializingSession.prototype.getType = function (type, style, value) {
        if (this.isFormula(value)) {
            return 'Formula';
        }
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
                    console.warn("AG Grid: Unrecognized data type for excel export [" + style.id + ".dataType=" + style.dataType + "]");
            }
        }
        return type;
    };
    ExcelXmlSerializingSession.prototype.addImage = function () {
        return;
    };
    ExcelXmlSerializingSession.prototype.createCell = function (styleId, type, value, valueFormatted) {
        var actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 'String' && valueFormatted) {
            value = valueFormatted;
        }
        var typeTransformed = (this.getType(type, actualStyle, value) || type);
        return {
            styleId: !!actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    };
    ExcelXmlSerializingSession.prototype.getValueTransformed = function (typeTransformed, value) {
        var _this = this;
        var wrapText = function (val) {
            if (_this.config.suppressTextAsCDATA) {
                return _.escapeString(val);
            }
            var cdataStart = '<![CDATA[';
            var cdataEnd = ']]>';
            var cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        };
        var convertBoolean = function (val) {
            if (!val || val === '0' || val === 'false') {
                return '0';
            }
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
    };
    ExcelXmlSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    };
    return ExcelXmlSerializingSession;
}(BaseExcelSerializingSession));
export { ExcelXmlSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUtILENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RTtJQUFnRCw4Q0FBMEM7SUFBMUY7O0lBOEZBLENBQUM7SUE1RmEsZ0RBQVcsR0FBckIsVUFBc0IsSUFBb0I7UUFDdEMsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVTLHdEQUFtQixHQUE3QixVQUE4QixZQUFxQjtRQUMvQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ2hFLENBQUM7SUFFUyw0Q0FBTyxHQUFqQixVQUFrQixJQUFtQixFQUFFLEtBQXdCLEVBQUUsS0FBb0I7UUFDakYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxTQUFTLENBQUM7U0FBRTtRQUNoRCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLFFBQVE7b0JBQ1QsT0FBTyxTQUFTLENBQUM7Z0JBQ3JCLEtBQUssUUFBUTtvQkFDVCxPQUFPLFFBQVEsQ0FBQztnQkFDcEIsS0FBSyxVQUFVO29CQUNYLE9BQU8sVUFBVSxDQUFDO2dCQUN0QixLQUFLLE9BQU87b0JBQ1IsT0FBTyxPQUFPLENBQUM7Z0JBQ25CLEtBQUssU0FBUztvQkFDVixPQUFPLFNBQVMsQ0FBQztnQkFDckI7b0JBQ0ksT0FBTyxDQUFDLElBQUksQ0FBQyx1REFBcUQsS0FBSyxDQUFDLEVBQUUsa0JBQWEsS0FBSyxDQUFDLFFBQVEsTUFBRyxDQUFDLENBQUM7YUFDakg7U0FDSjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFUyw2Q0FBUSxHQUFsQjtRQUNJLE9BQU87SUFDWCxDQUFDO0lBRVMsK0NBQVUsR0FBcEIsVUFBcUIsT0FBc0IsRUFBRSxJQUFtQixFQUFFLEtBQWEsRUFBRSxjQUE4QjtRQUMzRyxJQUFNLFdBQVcsR0FBc0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsQ0FBQSxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsUUFBUSxDQUFBLElBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxjQUFjLEVBQUU7WUFDL0QsS0FBSyxHQUFHLGNBQWMsQ0FBQztTQUMxQjtRQUNELElBQU0sZUFBZSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBRXpFLE9BQU87WUFDSCxPQUFPLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBUSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzdDLElBQUksRUFBRTtnQkFDRixJQUFJLEVBQUUsZUFBZTtnQkFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDO2FBQzFEO1NBQ0osQ0FBQztJQUNOLENBQUM7SUFFTyx3REFBbUIsR0FBM0IsVUFBNEIsZUFBOEIsRUFBRSxLQUFhO1FBQXpFLGlCQThCQztRQTdCRyxJQUFNLFFBQVEsR0FBRyxVQUFDLEdBQVc7WUFDekIsSUFBSSxLQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFO2dCQUNqQyxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFXLENBQUM7YUFDeEM7WUFDRCxJQUFNLFVBQVUsR0FBRyxXQUFXLENBQUM7WUFDL0IsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNoRCxPQUFPLFVBQVU7Z0JBQ2IsNEVBQTRFO2dCQUM1RSw2RUFBNkU7Z0JBQzdFLGlFQUFpRTtrQkFDL0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxHQUFHLFFBQVEsR0FBRyxVQUFVLEdBQUcsR0FBRyxDQUFDO2tCQUN0RSxRQUFRLENBQUM7UUFDbkIsQ0FBQyxDQUFDO1FBQ0YsSUFBTSxjQUFjLEdBQUcsVUFBQyxHQUFxQjtZQUN6QyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtnQkFBRSxPQUFPLEdBQUcsQ0FBQzthQUFFO1lBQzNELE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDO1FBRUYsUUFBUSxlQUFlLEVBQUU7WUFDckIsS0FBSyxRQUFRO2dCQUNULE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNCLEtBQUssUUFBUTtnQkFDVCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDeEMsS0FBSyxTQUFTO2dCQUNWLE9BQU8sY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDO2dCQUNJLE9BQU8sS0FBSyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztJQUVTLHFEQUFnQixHQUExQixVQUEyQixPQUFzQixFQUFFLElBQW1CLEVBQUUsS0FBYSxFQUFFLFVBQWtCO1FBQ3JHLE9BQU87WUFDSCxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQVEsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUM1RCxJQUFJLEVBQUU7Z0JBQ0YsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsS0FBSyxFQUFFLEtBQUs7YUFDZjtZQUNELFdBQVcsRUFBRSxVQUFVO1NBQzFCLENBQUM7SUFDTixDQUFDO0lBQ0wsaUNBQUM7QUFBRCxDQUFDLEFBOUZELENBQWdELDJCQUEyQixHQThGMUUifQ==