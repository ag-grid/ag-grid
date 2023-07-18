import { _ } from '@ag-grid-community/core';
function prepareString(str) {
    var split = str.split(/(\[[^\]]*\])/);
    for (var i = 0; i < split.length; i++) {
        // excel formulas require symbols to be escaped. Excel also requires $ to be 
        // placed in quotes but only when the $ is not wrapped inside of square brackets.
        var currentString = split[i];
        if (!currentString.length) {
            continue;
        }
        if (!currentString.startsWith('[')) {
            currentString = currentString.replace(/\$/g, '"$"');
        }
        split[i] = _.escapeString(currentString);
    }
    return split.join('');
}
var numberFormatFactory = {
    getTemplate: function (numberFormat) {
        var formatCode = numberFormat.formatCode, numFmtId = numberFormat.numFmtId;
        if (formatCode.length) {
            formatCode = prepareString(formatCode);
        }
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
export default numberFormatFactory;
