import { _getLocaleTextFromMap } from 'ag-stack';

import { FormulaError } from './ast/utils';

describe('formula error messages', () => {
    const error = new FormulaError(35, ['SUM', 2]);

    test('fill the named values of the default message', () => {
        expect(error.message).toBe('SUM: expected exactly 2 arguments.');
    });

    test('let a translation reorder the named values, or fill ${variable} by position', () => {
        const reordered = _getLocaleTextFromMap({
            formulaFunctionExpectedExactlyArguments: '引数は${count}個必要です（${function}）',
        });
        const positional = _getLocaleTextFromMap({
            formulaFunctionExpectedExactlyArguments: '${variable} needs ${variable}',
        });

        expect(error.getTranslatedMessage(reordered)).toBe('引数は2個必要です（SUM）');
        expect(error.getTranslatedMessage(positional)).toBe('SUM needs 2');
    });
});
