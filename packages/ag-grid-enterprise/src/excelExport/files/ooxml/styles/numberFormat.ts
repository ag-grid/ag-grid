import { _escapeString } from 'ag-stack';

import type { ExcelOOXMLTemplate } from 'ag-grid-community';

import type { NumberFormat } from '../../../assets/excelInterfaces';

function prepareString(str: string): string {
    // eslint-disable-next-line sonarjs/null-dereference, sonarjs/super-linear-regex -- flagged by eslint-plugin-sonarjs 4.2.1's stricter heuristic; value is non-null here (typed, guarded, or narrowed); flagged by eslint-plugin-sonarjs 4.2.1; pattern runs on short, non-user-controlled input
    const split = str.split(/(\[[^\]]*\])/);

    for (let i = 0; i < split.length; i++) {
        // excel formulas require symbols to be escaped. Excel also requires $ to be
        // placed in quotes but only when the $ is not wrapped inside of square brackets.
        let currentString = split[i];
        // eslint-disable-next-line sonarjs/null-dereference -- flagged by eslint-plugin-sonarjs 4.2.1's stricter heuristic; value is non-null here (typed, guarded, or narrowed)
        if (!currentString.length) {
            continue;
        }
        if (!currentString.startsWith('[')) {
            currentString = currentString.replace(/\$/g, '"$"');
        }

        split[i] = _escapeString(currentString) as string;
    }

    return split.join('');
}

const numberFormatFactory: ExcelOOXMLTemplate = {
    getTemplate(numberFormat: NumberFormat) {
        let { formatCode, numFmtId } = numberFormat;

        // eslint-disable-next-line sonarjs/null-dereference -- flagged by eslint-plugin-sonarjs 4.2.1's stricter heuristic; value is non-null here (typed, guarded, or narrowed)
        if (formatCode.length) {
            formatCode = prepareString(formatCode);
        }

        return {
            name: 'numFmt',
            properties: {
                rawMap: {
                    formatCode,
                    numFmtId,
                },
            },
        };
    },
};

export default numberFormatFactory;
