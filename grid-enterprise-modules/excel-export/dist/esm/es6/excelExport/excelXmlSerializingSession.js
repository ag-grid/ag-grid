import { _ } from '@ag-grid-community/core';
import { ExcelXmlFactory } from './excelXmlFactory';
import { BaseExcelSerializingSession } from './baseExcelSerializingSession';
export class ExcelXmlSerializingSession extends BaseExcelSerializingSession {
    createExcel(data) {
        return ExcelXmlFactory.createExcel(this.excelStyles, data);
    }
    getDataTypeForValue(valueForCell) {
        return this.isNumerical(valueForCell) ? 'Number' : 'String';
    }
    getType(type, style, value) {
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
                    console.warn(`AG Grid: Unrecognized data type for excel export [${style.id}.dataType=${style.dataType}]`);
            }
        }
        return type;
    }
    addImage() {
        return;
    }
    createCell(styleId, type, value, valueFormatted) {
        const actualStyle = this.getStyleById(styleId);
        if (!(actualStyle === null || actualStyle === void 0 ? void 0 : actualStyle.dataType) && type === 'String' && valueFormatted) {
            value = valueFormatted;
        }
        const typeTransformed = (this.getType(type, actualStyle, value) || type);
        return {
            styleId: !!actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    }
    getValueTransformed(typeTransformed, value) {
        const wrapText = (val) => {
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
        const convertBoolean = (val) => {
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
    }
    createMergedCell(styleId, type, value, numOfCells) {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZXhjZWxFeHBvcnQvZXhjZWxYbWxTZXJpYWxpemluZ1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUtILENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUU1RSxNQUFNLE9BQU8sMEJBQTJCLFNBQVEsMkJBQTBDO0lBRTVFLFdBQVcsQ0FBQyxJQUFvQjtRQUN0QyxPQUFPLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRVMsbUJBQW1CLENBQUMsWUFBcUI7UUFDL0MsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNoRSxDQUFDO0lBRVMsT0FBTyxDQUFDLElBQW1CLEVBQUUsS0FBd0IsRUFBRSxLQUFvQjtRQUNqRixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFBRSxPQUFPLFNBQVMsQ0FBQztTQUFFO1FBQ2hELElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDekIsUUFBUSxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7Z0JBQ3hDLEtBQUssUUFBUTtvQkFDVCxPQUFPLFNBQVMsQ0FBQztnQkFDckIsS0FBSyxRQUFRO29CQUNULE9BQU8sUUFBUSxDQUFDO2dCQUNwQixLQUFLLFVBQVU7b0JBQ1gsT0FBTyxVQUFVLENBQUM7Z0JBQ3RCLEtBQUssT0FBTztvQkFDUixPQUFPLE9BQU8sQ0FB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