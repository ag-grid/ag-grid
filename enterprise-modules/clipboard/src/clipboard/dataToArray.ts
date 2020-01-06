// Based on https://stackoverflow.com/a/14991797
// This will parse a delimited string into an array of arrays.
export function dataToArray(strData: string, delimiter = ','): string[][] {
    const data: any[][] = [];
    const isNewline = (char: string) => char === '\r' || char === '\n';

    let insideQuotedField = false;

    // iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, column = 0, c = 0; c < strData.length; c++) {
        const previousChar = strData[c - 1], currentChar = strData[c], nextChar = strData[c + 1];
        const ensureDataExists = () => {
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
                    // double quote inside quoted field
                    data[row][column] += '"';
                    c++;
                } else {
                    insideQuotedField = false;
                }

                continue;
            } else if (previousChar === undefined || previousChar === delimiter || isNewline(previousChar)) {
                insideQuotedField = true;
                continue;
            }
        }

        if (!insideQuotedField) {
            if (currentChar === delimiter) {
                // move to next column
                column++;
                ensureDataExists();

                continue;
            } else if (isNewline(currentChar)) {
                // newline, move to next row
                column = 0;
                row++;
                ensureDataExists();

                if (currentChar === '\r' && nextChar === '\n') {
                    // skip over second newline character if it exists
                    c++;
                }

                continue;
            }
        }

        data[row][column] += currentChar;
    }

    return data;
}
