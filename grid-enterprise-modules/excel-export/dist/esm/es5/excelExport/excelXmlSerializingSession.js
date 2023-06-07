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
    ExcelXmlSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.getStyleById(styleId);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUtILENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RTtJQUFnRCw4Q0FBMEM7SUFBMUY7O0lBMkZBLENBQUM7SUF6RmEsZ0RBQVcsR0FBckIsVUFBc0IsSUFBb0I7UUFDdEMsT0FBTyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVTLHdEQUFtQixHQUE3QixVQUE4QixZQUFxQjtRQUMvQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQ2hFLENBQUM7SUFFUyw0Q0FBTyxHQUFqQixVQUFrQixJQUFtQixFQUFFLEtBQXdCLEVBQUUsS0FBb0I7UUFDakYsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTyxTQUFTLENBQUM7U0FBRTtRQUNoRCxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUN4QyxLQUFLLFFBQVE7b0JBQ1QsT0FBTyxTQUFTLENBQUM7Z0JBQ3JCLEtBQUssUUFBUTtvQkFDVCxPQUFPLFFBQVEsQ0FBQztnQkFDcEIsS0FBSyxVQUFVO29CQUNYLE9BQU8sVUFBVSxD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