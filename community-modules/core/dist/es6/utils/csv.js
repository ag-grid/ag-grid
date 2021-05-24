/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
// Based on https://stackoverflow.com/a/14991797
// This will parse a delimited string into an array of arrays.
export function stringToArray(strData, delimiter) {
    if (delimiter === void 0) { delimiter = ','; }
    var data = [];
    var isNewline = function (char) { return char === '\r' || char === '\n'; };
    var insideQuotedField = false;
    if (strData === '') {
        return [['']];
    }
    var _loop_1 = function (row, column, position) {
        var previousChar = strData[position - 1];
        var currentChar = strData[position];
        var nextChar = strData[position + 1];
        var ensureDataExists = function () {
            if (!data[row]) {
                // create row if it doesn't exist
                data[row] = [];
            }
            if (!data[row][column]) {
                // create column if it doesn't exist
                data[row][column] = '';
            }
        };
        ensureDataExists();
        if (currentChar === '"') {
            if (insideQuotedField) {
                if (nextChar === '"') {
                    // unescape double quote
                    data[row][column] += '"';
                    position++;
                }
                else {
                    // exit quoted field
                    insideQuotedField = false;
                }
                return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
            }
            else if (previousChar === undefined || previousChar === delimiter || isNewline(previousChar)) {
                // enter quoted field
                insideQuotedField = true;
                return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
            }
        }
        if (!insideQuotedField) {
            if (currentChar === delimiter) {
                // move to next column
                column++;
                ensureDataExists();
                return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
            }
            else if (isNewline(currentChar)) {
                // move to next row
                column = 0;
                row++;
                ensureDataExists();
                if (currentChar === '\r' && nextChar === '\n') {
                    // skip over second newline character if it exists
                    position++;
                }
                return out_row_1 = row, out_column_1 = column, out_position_1 = position, "continue";
            }
        }
        // add current character to current column
        data[row][column] += currentChar;
        out_row_1 = row;
        out_column_1 = column;
        out_position_1 = position;
    };
    var out_row_1, out_column_1, out_position_1;
    // iterate over each character, keep track of current row and column (of the returned array)
    for (var row = 0, column = 0, position = 0; position < strData.length; position++) {
        _loop_1(row, column, position);
        row = out_row_1;
        column = out_column_1;
        position = out_position_1;
    }
    return data;
}
