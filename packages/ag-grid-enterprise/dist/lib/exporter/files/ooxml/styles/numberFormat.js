// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var numberFormatFactory = {
    getTemplate: function (numberFormat) {
        var formatCode = numberFormat.formatCode, numFmtId = numberFormat.numFmtId;
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode: formatCode,
                    numFmtId: numFmtId
                }
            }
        };
    }
};
exports.default = numberFormatFactory;
exports.numberFormatMap = {
    '0': 1,
    '0.00': 2,
    '#,##0': 3,
    '#,##0.00': 4,
    '0%': 9,
    '0.00%': 10,
    '0.00E+00': 11,
    '# ?/?': 12,
    '# ??/??': 13,
    'mm-dd-yy': 14,
    'd-mmm-yy': 15,
    'd-mmm': 16,
    'mmm-yy': 17,
    'h:mm AM/PM': 18,
    'h:mm:ss AM/PM': 19,
    'h:mm': 20,
    'h:mm:ss': 21,
    'm/d/yy h:mm': 22,
    '#,##0 ;(#,##0)': 37,
    '#,##0 ;[Red](#,##0)': 38,
    '#,##0.00;(#,##0.00)': 39,
    '#,##0.00;[Red](#,##0.00)': 40,
    'mm:ss': 45,
    '[h]:mm:ss': 46,
    'mmss.0': 47,
    '##0.0E+0': 48,
    '@': 49
};
