export type FormulaErrorType = '#REF!' | '#NAME?' | '#CIRCREF!' | '#PARSE!' | '#VALUE!' | '#DIV/0!' | '#ERROR!';

type FormulaErrorDefinition = readonly [localeKey: string, defaultMessage: string, type?: FormulaErrorType];

const FORMULA_ERRORS: Record<number, FormulaErrorDefinition> = {
    1: ['invalidFormulaValidation', 'Invalid formula.'],
    2: ['formulaParseInvalidCellReference', 'Invalid cell reference: ${variable}.'],
    3: ['formulaParseInvalidRangeEndReference', 'Invalid range end reference.'],
    4: ['formulaParseUnterminatedString', 'Unterminated string.'],
    5: ['formulaParseUnexpectedCharacter', 'Unexpected character: ${variable}.'],
    6: ['formulaParseOperatorStackUnderflow', 'Operator stack underflow.'],
    7: ['formulaParseMissingOperand', "Missing operand for '${variable}'."],
    8: ['formulaParseInternalUnexpectedFrameDuringReduction', 'Internal error: unexpected frame during reduction.'],
    9: ['formulaParseInternalUnexpectedFrameBeforeOpenParen', "Internal error: unexpected frame before '('."],
    10: ['formulaParseMisplacedComma', 'Misplaced comma.'],
    11: ['formulaParseCommaOutsideFunctionCall', 'Comma outside of a function call.'],
    12: ['formulaParseInternalUnexpectedFrameBeforeCloseParen', "Internal error: unexpected frame before ')'."],
    13: ['formulaParseMismatchedParentheses', 'Mismatched parentheses.'],
    14: ['formulaParseUnsupportedOperand', 'Unsupported operand: ${variable}.'],
    15: [
        'formulaParseMismatchedParenthesesOrUnfinishedFunctionCall',
        'Mismatched parentheses or unfinished function call.',
    ],
    16: ['formulaParseInvalidExpression', 'Invalid expression.'],
    17: ['formulaParseFormulasMustBeginWithEquals', 'Formulas must begin with =.'],
    18: [
        'formulaSerializeStringContainsQuote',
        'String contains a quote (") which the tokenizer does not support.',
        '#PARSE!',
    ],
    19: [
        'formulaSerializeCannotProduceAbsoluteColumnLabelFromId',
        "Cannot produce absolute COLUMN label from id '${variable}'.",
    ],
    20: [
        'formulaSerializeCannotProduceAbsoluteRowIndexFromId',
        "Cannot produce absolute ROW index from id '${variable}'.",
    ],
    21: ['formulaSerializeCannotProduceRowIndexFromId', "Cannot produce ROW index from id '${variable}'."],
    22: ['formulaSerializeCannotMapColumnIdToA1Label', "Cannot map column id '${variable}' to A1 label."],
    23: ['formulaSerializeCannotParseAbsoluteRowIndex', "Cannot parse absolute row index '${variable}'."],
    24: ['formulaSerializeCannotMapRowIdToA1Index', "Cannot map row id '${variable}' to A1 index."],
    25: ['formulaEvalRangeNotAllowedInScalarContext', 'Range is not allowed in scalar context.'],
    26: ['formulaEvalUnknownReferenceToCell', 'Unknown reference to cell.', '#REF!'],
    27: ['formulaEvalUnsupportedOperation', 'Unsupported operation ${variable}.', '#NAME?'],
    28: ['formulaEvalInvalidAbsoluteRow', 'Invalid absolute row.', '#REF!'],
    29: ['formulaEvalUnrecognisedRowId', 'Unrecognised row id.', '#REF!'],
    30: ['formulaEvalInvalidAbsoluteColumn', 'Invalid absolute column.', '#REF!'],
    31: ['formulaEvalUnrecognisedColumnId', 'Unrecognised column id.', '#REF!'],
    32: ['formulaEvalUnrecognisedRowInRange', 'Unrecognised row in range.', '#REF!'],
    33: ['formulaEvalUnrecognisedReferenceToCell', 'Unrecognised reference to cell.', '#REF!'],
    34: ['formulaEvalIncompleteRangeReference', 'Incomplete range reference.', '#REF!'],
    35: ['formulaFunctionExpectedExactlyArguments', '${variable}: expected exactly ${variable} arguments.'],
    36: ['formulaFunctionExpectedAtMostArguments', '${variable}: expected at most ${variable} arguments.'],
    37: ['formulaFunctionExpectedAtLeastArguments', '${variable}: expected at least ${variable} arguments.'],
    38: [
        'formulaFunctionInvalidCriteriaWildcardsWithComparator',
        'Invalid criteria: wildcards with comparator.',
        '#VALUE!',
    ],
    39: ['formulaFunctionNonNumericArgument', '${variable}: non-numeric argument.', '#VALUE!'],
    40: ['formulaFunctionDivisionByZero', '${variable}: division by zero.', '#DIV/0!'],
    41: ['formulaFunctionCannotCombineDatesWithBigInt', '${variable}: cannot combine dates with BigInt.', '#VALUE!'],
    42: [
        'formulaFunctionRequiresAtLeastOneNumericValue',
        '${variable}: requires at least one numeric value.',
        '#PARSE!',
    ],
    43: ['formulaFunctionRequiresAtLeastOneValue', '${variable}: requires at least one value.'],
    44: ['formulaFunctionAllValuesMustBeNumbers', '${variable}: all values must be numbers.', '#VALUE!'],
    45: ['formulaFunctionArgumentMustBeRange', '${variable}: ${variable} argument must be a range.', '#VALUE!'],
    46: ['formulaFunctionArgumentMustBeValue', '${variable}: ${variable} argument must be a value.', '#VALUE!'],
    47: ['formulaFunctionRangesHaveDifferentSizes', '${variable}: ranges have different sizes.', '#VALUE!'],
    48: ['formulaFunctionValuesMustBeNumeric', '${variable}: values must be numeric.', '#VALUE!'],
    49: ['formulaFunctionValuesMustBeIntegers', '${variable}: values must be integers.', '#VALUE!'],
    50: ['formulaFunctionUnsupportedValueType', '${variable}: unsupported value type.', '#VALUE!'],
    51: ['formulaServiceCircularReference', 'Circular reference.', '#CIRCREF!'],
    52: ['formulaServiceExpectedParsableFormula', 'Expected parsable formula.', '#PARSE!'],
    53: ['formulaServiceInternalSchedulingError', 'Internal scheduling error.'],
    54: ['formulaFunctionDivNonNumericArgument', 'DIV: non-numeric argument.', '#VALUE!'],
    55: ['formulaFunctionDivDivisionByZero', 'DIV: division by zero.', '#DIV/0!'],
    56: ['formulaFunctionSumCannotCombineDatesWithBigInt', 'SUM: cannot combine dates with BigInt.', '#VALUE!'],
    57: ['formulaFunctionSumRequiresAtLeastOneNumericValue', 'SUM: requires at least one numeric value.', '#PARSE!'],
    58: ['formulaFunctionAvgRequiresAtLeastOneValue', 'AVG: requires at least one value.'],
    59: ['formulaFunctionMedianAllValuesMustBeNumbers', 'MEDIAN: all values must be numbers.', '#VALUE!'],
    60: ['formulaFunctionMedianRequiresAtLeastOneValue', 'MEDIAN: requires at least one value.'],
    61: ['formulaFunctionSumifFirstArgumentMustBeRange', 'SUMIF: first argument must be a range.', '#VALUE!'],
    62: [
        'formulaFunctionSumifSecondArgumentMustBeValue',
        'SUMIF: second argument must be a value (criteria).',
        '#VALUE!',
    ],
    63: [
        'formulaFunctionSumifThirdArgumentMustBeRange',
        'SUMIF: third argument must be a range (sum_range).',
        '#VALUE!',
    ],
    64: ['formulaFunctionSumifRangesHaveDifferentSizes', 'SUMIF: ranges have different sizes.', '#VALUE!'],
    65: ['formulaFunctionCountifFirstArgumentMustBeRange', 'COUNTIF: first argument must be a range.', '#VALUE!'],
    66: [
        'formulaFunctionCountifSecondArgumentMustBeValue',
        'COUNTIF: second argument must be a value (criteria).',
        '#VALUE!',
    ],
    67: ['formulaFunctionConcatUnsupportedValueType', 'CONCAT: unsupported value type.', '#VALUE!'],
    68: ['formulaFunctionMinRequiresAtLeastOneValue', 'MIN: requires at least one value.'],
    69: ['formulaFunctionMaxRequiresAtLeastOneValue', 'MAX: requires at least one value.'],
    70: ['formulaFunctionPercentNonNumericArgument', 'PERCENT: non-numeric argument.', '#VALUE!'],
    71: ['formulaFunctionPowerNonNumericArgument', 'POWER: non-numeric argument.', '#VALUE!'],
};

export type FormulaErrorId = keyof typeof FORMULA_ERRORS;

const interpolateVariables = (template: string, variableValues?: string[]): string => {
    if (!variableValues?.length) {
        return template;
    }

    let localisedText = template;
    let found = 0;

    while (found < variableValues.length) {
        const idx = localisedText.indexOf('${variable}');
        if (idx === -1) {
            break;
        }
        localisedText = localisedText.replace('${variable}', variableValues[found++]);
    }

    return localisedText;
};

const normaliseVariableValues = (values?: readonly unknown[]): string[] | undefined => {
    if (!values?.length) {
        return undefined;
    }
    return values.map((value) => String(value));
};

export const getFormulaErrorDefinition = (errorId: FormulaErrorId): FormulaErrorDefinition => {
    return FORMULA_ERRORS[errorId];
};

export const getFormulaErrorDefaultMessage = (errorId: FormulaErrorId, variableValues?: readonly unknown[]): string => {
    const [, defaultMessage] = getFormulaErrorDefinition(errorId);
    return interpolateVariables(defaultMessage, normaliseVariableValues(variableValues));
};

export const interpolateFormulaErrorMessage = (message: string, variableValues?: readonly unknown[]): string => {
    return interpolateVariables(message, normaliseVariableValues(variableValues));
};
