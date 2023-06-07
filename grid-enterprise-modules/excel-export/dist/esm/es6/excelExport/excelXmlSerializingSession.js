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
    createCell(styleId, type, value) {
        const actualStyle = this.getStyleById(styleId);
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