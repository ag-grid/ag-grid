import type { AdvancedFilterModel, AgColumn, BaseCellDataType } from 'ag-grid-community';

import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { AutocompleteEntry, AutocompleteListParams } from './autocomplete/autocompleteParams';
import type {
    AutocompleteUpdate,
    ColumnFilterModelOperands,
    FilterExpressionFunction,
    FilterExpressionFunctionParams,
    FilterExpressionParserParams,
    FilterExpressionValidationError,
} from './filterExpressionUtils';
import {
    checkAndUpdateExpression,
    findEndPosition,
    findStartPosition,
    getBigIntParser,
    getNumberParser,
    getSearchString,
    updateExpression,
} from './filterExpressionUtils';

interface Parser {
    parse(char: string, position: number): boolean | undefined;
    complete(position: number): void;
    getValidationError(): FilterExpressionValidationError | null;
}

class ColumnParser implements Parser {
    public valid = true;
    public endPosition: number | undefined;
    public baseCellDataType: BaseCellDataType;
    public column: AgColumn | null | undefined;
    public hasStartChar = false;
    public hasEndChar = false;
    private colName: string = '';
    private colId: string;

    constructor(
        private readonly params: FilterExpressionParserParams,
        public readonly startPosition: number
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (char === COL_FILTER_EXPRESSION_START_CHAR && !this.colName) {
            this.hasStartChar = true;
        } else if (char === COL_FILTER_EXPRESSION_END_CHAR && this.hasStartChar) {
            const isMatch = this.parseColumn(false, position);
            if (isMatch) {
                this.hasEndChar = true;
                return false;
            } else {
                this.colName += char;
            }
        } else {
            this.colName += char;
        }
        return undefined;
    }

    public getDisplayValue(): string {
        return (
            (this.hasStartChar ? COL_FILTER_EXPRESSION_START_CHAR : '') +
            this.colName +
            (this.hasEndChar ? COL_FILTER_EXPRESSION_END_CHAR : '')
        );
    }

    public getColId(): string {
        return this.colId;
    }

    public complete(position: number): void {
        this.parseColumn(true, position);
    }

    public getValidationError(): FilterExpressionValidationError | null {
        return this.valid
            ? null
            : {
                  message: this.params.advFilterExpSvc.translate('advancedFilterValidationInvalidColumn'),
                  startPosition: this.startPosition,
                  endPosition: this.endPosition ?? this.params.expression.length - 1,
              };
    }

    private parseColumn(fromComplete: boolean, endPosition: number): boolean {
        this.endPosition = endPosition;
        const colValue = this.params.advFilterExpSvc.getColId(this.colName);
        if (colValue && this.hasStartChar) {
            this.colId = colValue.colId;
            checkAndUpdateExpression(this.params, this.colName, colValue.columnName, endPosition - 1);
            this.colName = colValue.columnName;
            this.column = this.params.colModel.getNonPivotCol(this.colId);
            if (this.column) {
                this.baseCellDataType = this.params.dataTypeSvc?.getBaseDataType(this.column) ?? 'text';
                return true;
            }
        }
        if (fromComplete) {
            this.valid = false;
        }
        this.baseCellDataType = 'text';
        return false;
    }
}

class OperatorParser implements Parser {
    public valid = true;
    public endPosition: number | undefined;
    public expectedNumOperands: number = 0;
    private operator: string = '';
    private parsedOperator: string;
    /** Last character of the resolved name; set once the region is settled. */
    private matchEndPosition: number | undefined;

    constructor(
        private readonly params: FilterExpressionParserParams,
        public readonly startPosition: number,
        private readonly baseCellDataType: BaseCellDataType,
        private readonly column: AgColumn | null | undefined
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (this.matchEndPosition == null) {
            const isTerminator = char === ' ' || char === ')';
            if (!isTerminator || !this.parseOperator(false, position - 1)) {
                this.operator += char;
                return undefined;
            }
        }
        // A resolved name may run past the terminator that settled it, so the rest of it is consumed as read.
        return position <= this.matchEndPosition! ? undefined : true;
    }

    public complete(position: number): void {
        if (this.matchEndPosition == null) {
            this.parseOperator(true, position);
        }
    }

    public getValidationError(): FilterExpressionValidationError | null {
        return this.valid
            ? null
            : {
                  message: this.params.advFilterExpSvc.translate('advancedFilterValidationInvalidOption'),
                  startPosition: this.startPosition,
                  endPosition: this.endPosition ?? this.params.expression.length - 1,
              };
    }

    public getDisplayValue(): string {
        return this.operator;
    }

    public getOperatorKey(): string {
        return this.parsedOperator;
    }

    /** The longest name in `entries` written at the start position, and whether one is still being typed. */
    private matchOperatorName(
        entries: AutocompleteEntry[],
        minLength: number,
        partialSearchValue: string
    ): { key: string | undefined; length: number; isPartialMatch: boolean } {
        const { params, startPosition } = this;
        const expression = params.expression;
        let key: string | undefined;
        let length = 0;
        let isPartialMatch = false;
        for (let i = 0, len = entries.length; i < len; ++i) {
            const entry = entries[i];
            const displayValue = entry.displayValue ?? '';
            // Lengths come from the name as written: lower-casing can change them, `İ` becoming two units.
            const lowerCaseDisplayValue = displayValue.toLocaleLowerCase();
            if (
                displayValue.length > length &&
                displayValue.length >= minLength &&
                isNameAt(expression, startPosition, displayValue, lowerCaseDisplayValue)
            ) {
                key = entry.key;
                length = displayValue.length;
            }
            if (lowerCaseDisplayValue.startsWith(partialSearchValue)) {
                isPartialMatch = true;
            }
        }
        return { key, length, isPartialMatch };
    }

    /** Longest match wins, offered names first, so a name another starts with or contains still resolves. */
    private parseOperator(fromComplete: boolean, endPosition: number): boolean {
        const { params, startPosition } = this;
        const expression = params.expression;
        const columnOperators = params.advFilterExpSvc.getColumnOperators(this.baseCellDataType, this.column);
        this.endPosition = endPosition;

        const minLength = endPosition - startPosition + 1;
        const partialSearchValue = expression.slice(startPosition, endPosition + 1).toLocaleLowerCase() + ' ';
        const activeOperators = columnOperators?.activeOperators;
        let match = this.matchOperatorName(
            columnOperators?.operators.getEntries(activeOperators) ?? [],
            minLength,
            partialSearchValue
        );
        // A second list only where what is offered is less than what resolves; otherwise the same scan twice.
        if (activeOperators) {
            const resolvable = this.matchOperatorName(
                columnOperators!.operators.getEntries(),
                minLength,
                partialSearchValue
            );
            if (resolvable.length > match.length || (!match.key && resolvable.isPartialMatch)) {
                match = resolvable;
            }
        }
        const { key: matchedOperator, isPartialMatch } = match;

        if (matchedOperator) {
            const matchEndPosition = startPosition + match.length - 1;
            this.parsedOperator = matchedOperator;
            this.endPosition = matchEndPosition;
            this.matchEndPosition = matchEndPosition;
            const operator = params.advFilterExpSvc.getExpressionOperator(
                this.baseCellDataType,
                matchedOperator,
                this.column
            )!;
            this.expectedNumOperands = operator.numOperands;
            const operatorDisplayValue = operator.displayValue;
            const userValue = expression.slice(startPosition, matchEndPosition + 1);
            checkAndUpdateExpression(params, userValue, operatorDisplayValue, matchEndPosition);
            this.operator = operatorDisplayValue;
            return true;
        }
        if (fromComplete || !isPartialMatch) {
            this.valid = false;
        }
        return false;
    }
}

/**
 * A name only resolves where a terminator or the expression end follows it: were it allowed to run into the
 * next character, the caller would drop that character and the text would name an option it does not spell.
 */
function isNameAt(
    expression: string,
    startPosition: number,
    displayValue: string,
    lowerCaseDisplayValue: string
): boolean {
    const endPosition = startPosition + displayValue.length;
    const nextChar = expression[endPosition];
    return (
        (nextChar === undefined || nextChar === ' ' || nextChar === ')') &&
        expression.slice(startPosition, endPosition).toLocaleLowerCase() === lowerCaseDisplayValue
    );
}

class OperandParser implements Parser {
    public endPosition: number | undefined;
    private quotes: `'` | `"` | undefined;
    private operand = '';
    private modelValue: number | string;
    private validationMessage: string | null = null;

    private readonly filterValidationSetters: Record<
        BaseCellDataType,
        (modelValue: string | number | bigint | null) => any
    > = {
        // Read from the argument, not `this.modelValue`, which keeps the raw text when the parser rejects it.
        number: (modelValue) => {
            // A column's own `numberParser` reports unreadable input as null, where `Number` gives NaN.
            if (modelValue == null || isNaN(modelValue as number)) {
                this.validationMessage = this.params.advFilterExpSvc.translate('advancedFilterValidationNotANumber');
            }
        },
        // `1.5` is a number the parser still rejects, so this needs its own message, not the number one.
        bigint: (modelValue) => {
            if (modelValue == null) {
                this.validationMessage = this.params.advFilterExpSvc.translate('advancedFilterValidationNotABigInt');
            }
        },
        date: (modelValue) => {
            if (modelValue == null) {
                this.validationMessage = this.params.advFilterExpSvc.translate('advancedFilterValidationInvalidDate');
            }
        },
        dateString: (...args) => this.filterValidationSetters.date(...args),
        dateTime: (...args) => this.filterValidationSetters.date(...args),
        dateTimeString: (...args) => this.filterValidationSetters.date(...args),
        boolean(): void {},
        object(): void {},
        text(): void {},
    };

    constructor(
        private readonly params: FilterExpressionParserParams,
        public readonly startPosition: number,
        private readonly baseCellDataType: BaseCellDataType,
        private readonly column: AgColumn | null | undefined
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (char === ' ') {
            if (this.quotes) {
                this.operand += char;
            } else {
                this.parseOperand(false, position);
                return true;
            }
        } else if (char === ')') {
            if (!this.quotes) {
                this.parseOperand(false, position - 1);
                return true;
            } else {
                this.operand += char;
            }
        } else if (!this.operand && !this.quotes && (char === `'` || char === `"`)) {
            this.quotes = char;
        } else if (this.quotes && char === this.quotes) {
            this.parseOperand(false, position);
            this.quotes = undefined;
            return false;
        } else {
            this.operand += char;
        }
        return undefined;
    }

    public complete(position: number): void {
        this.parseOperand(true, position);
    }

    public getValidationError(): FilterExpressionValidationError | null {
        return this.validationMessage
            ? {
                  message: this.validationMessage,
                  startPosition: this.startPosition,
                  endPosition: this.endPosition ?? this.params.expression.length - 1,
              }
            : null;
    }

    public isInsideQuotes(): boolean {
        return this.quotes != null;
    }

    public getRawValue(): string {
        return this.operand;
    }

    public getModelValue(): string | number {
        return this.modelValue;
    }

    /**
     * The operand the builder should present and edit: the model value where that is valid input,
     * otherwise the text the user typed, which the model value cannot be turned back into.
     */
    public getBuilderValue(): string | number {
        return this.params.advFilterExpSvc.isOperandModelValueEditable(this.baseCellDataType, this.column)
            ? this.modelValue
            : this.operand;
    }

    private parseOperand(fromComplete: boolean, position: number): void {
        const { advFilterExpSvc } = this.params;
        this.endPosition = position;
        this.modelValue = this.operand;
        if (fromComplete && this.quotes) {
            // missing end quote
            this.validationMessage = advFilterExpSvc.translate('advancedFilterValidationMissingQuote');
        } else if (this.modelValue === '') {
            this.validationMessage = advFilterExpSvc.translate('advancedFilterValidationMissingValue');
        } else {
            const modelValue = advFilterExpSvc.getOperandModelValue(this.operand, this.baseCellDataType, this.column!);
            if (modelValue != null) {
                this.modelValue = modelValue;
            }
            this.filterValidationSetters[this.baseCellDataType](modelValue);
        }
    }
}

/** One value is the operand alone, with no syntax of its own; two are a comma-separated pair in optional brackets. */
class OperandsParser implements Parser {
    private readonly parsers: OperandParser[] = [];
    private parser: OperandParser | undefined;
    private expectSeparator = false;
    private hasOpenBracket = false;
    private validationMessage: string | null = null;
    /** Also marks the region as rejected: the rest of the text belongs to the error reported at this position. */
    private validationEndPosition: number | undefined;

    constructor(
        private readonly params: FilterExpressionParserParams,
        public readonly startPosition: number,
        private readonly baseCellDataType: BaseCellDataType,
        private readonly column: AgColumn | null | undefined,
        private readonly expectedNumOperands: number
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (this.expectedNumOperands > 1) {
            return this.parseSeveral(char, position);
        }
        this.startOperand(position); // one value, so no separator syntax of its own
        return this.parser!.parse(char, position);
    }

    public complete(position: number): void {
        if (this.parser && !this.expectSeparator) {
            this.finishOperand(position);
        }
        if (this.expectedNumOperands < 2) {
            return;
        }
        if (this.parsers.length < this.expectedNumOperands) {
            this.reject('advancedFilterValidationMissingValue');
        } else if (this.hasOpenBracket) {
            this.reject('advancedFilterValidationMissingEndBracket');
        }
    }

    public getValidationError(): FilterExpressionValidationError | null {
        // An operand's own fault has a span and names the character at issue, so it beats the region's.
        const { validationMessage, validationEndPosition, parsers } = this;
        for (let i = 0, len = parsers.length; i < len; ++i) {
            const error = parsers[i].getValidationError();
            if (error) {
                return error;
            }
        }
        if (validationMessage) {
            // With no span of its own the fault is that the expression stopped, not that something in it is wrong.
            const atEnd = this.params.expression.length;
            return {
                message: validationMessage,
                startPosition: validationEndPosition == null ? atEnd : this.startPosition,
                endPosition: validationEndPosition ?? atEnd,
            };
        }
        return null;
    }

    public isComplete(): boolean {
        return this.parsers.length >= this.expectedNumOperands;
    }

    public getParsers(): OperandParser[] {
        return this.parsers;
    }

    private parseSeveral(char: string, position: number): boolean | undefined {
        // Read live throughout: `finishOperand` sets `expectSeparator`, and the reads below straddle it.
        const parser = this.parser;
        if (this.validationEndPosition != null) {
            return undefined;
        }

        if (parser && !this.expectSeparator && parser.isInsideQuotes()) {
            return this.delegate(char, position);
        }

        if (char === ' ') {
            if (parser && !this.expectSeparator) {
                this.finishOperand(position - 1);
            }
            // Spacing between the values; past the last one an unbracketed region is over.
            return this.expectSeparator && this.isComplete() && !this.hasOpenBracket ? true : undefined;
        }

        if (char === '(' && !parser && !this.hasOpenBracket && !this.parsers.length) {
            this.hasOpenBracket = true;
            return undefined;
        }

        if (char === ',') {
            if (!parser) {
                return this.reject('advancedFilterValidationMissingValue', position);
            }
            if (!this.expectSeparator) {
                this.finishOperand(position - 1);
            }
            if (this.isComplete() && !this.hasOpenBracket) {
                return true;
            }
            this.parser = undefined;
            this.expectSeparator = false;
            return this.isComplete() ? this.reject('advancedFilterValidationMissingEndBracket', position) : undefined;
        }

        if (char === ')') {
            if (parser && !this.expectSeparator) {
                this.finishOperand(position - 1);
            }
            if (!this.hasOpenBracket) {
                // The enclosing group's bracket ended the region, so `complete` never runs to report a gap.
                if (!this.isComplete()) {
                    this.reject('advancedFilterValidationMissingValue');
                }
                return true;
            }
            return this.isComplete() ? false : this.reject('advancedFilterValidationMissingValue', position);
        }

        if (this.expectSeparator) {
            // Past the last value the fault is the bracket left open; before it, the missing separator.
            return this.reject(
                this.isComplete()
                    ? 'advancedFilterValidationMissingEndBracket'
                    : 'advancedFilterValidationMissingValue',
                position
            );
        }

        this.startOperand(position);
        return this.delegate(char, position);
    }

    private delegate(char: string, position: number): boolean | undefined {
        // The inner parser only reports back on a closing quote, which ends the operand but not the region.
        if (this.parser!.parse(char, position) != null) {
            this.expectSeparator = true;
        }
        return undefined;
    }

    private startOperand(position: number): void {
        if (this.parser) {
            return;
        }
        this.parser = new OperandParser(this.params, position, this.baseCellDataType, this.column);
        this.parsers.push(this.parser);
    }

    private finishOperand(position: number): void {
        this.parser!.complete(position);
        this.expectSeparator = true;
    }

    /** Returns undefined, so the region keeps the rest of the text rather than being abandoned and restarted. */
    private reject(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, position?: number): undefined {
        this.validationMessage ??= this.params.advFilterExpSvc.translate(key);
        if (position != null) {
            this.validationEndPosition ??= position;
        }
        return undefined;
    }
}

export const COL_FILTER_EXPRESSION_START_CHAR = '[';
export const COL_FILTER_EXPRESSION_END_CHAR = ']';

export class ColFilterExpressionParser {
    private endPosition: number | undefined;
    private isAwaiting = true;
    private parser: Parser | undefined;
    private columnParser: ColumnParser | undefined;
    private operatorParser: OperatorParser | undefined;
    private operandsParser: OperandsParser | undefined;

    private readonly operandValueGetters: {
        number: (a: string) => number;
        bigint: (a: string) => bigint;
        date: (a: string) => Date;
        dateString: (a: string) => Date;
        dateTime: (a: string) => Date;
        dateTimeString: (a: string) => Date;
        boolean: (a: string) => string;
        object: (a: string) => string;
        text: (a: string) => string;
    } = {
        number: (operand) => getNumberParser(this.columnParser!.column, this.params.gos)(operand)!,
        bigint: (operand) => getBigIntParser(this.columnParser!.column, this.params.gos)(operand)!,
        date: (operand) =>
            this.params.valueSvc.parseValue(this.columnParser!.column!, null, operand, undefined) as Date,
        dateString: (operand) => this.operandValueGetters.date(operand),
        dateTime: (operand) => this.operandValueGetters.date(operand),
        dateTimeString: (operand) => this.operandValueGetters.date(operand),
        boolean: (operand) => operand,
        object: (operand) => operand,
        text: (operand) => operand,
    };

    constructor(
        private readonly params: FilterExpressionParserParams,
        public readonly startPosition: number
    ) {}

    public parseExpression(): number {
        let i = this.startPosition;
        const { expression } = this.params;
        while (i < expression.length) {
            const char = expression[i];
            if (char === ' ' && this.isAwaiting) {
                // ignore duplicate spaces
            } else {
                this.isAwaiting = false;
                if (!this.parser) {
                    let parser: Parser;
                    if (!this.columnParser) {
                        this.columnParser = new ColumnParser(this.params, i);
                        parser = this.columnParser;
                    } else if (!this.operatorParser) {
                        this.operatorParser = new OperatorParser(
                            this.params,
                            i,
                            this.columnParser.baseCellDataType,
                            this.columnParser.column
                        );
                        parser = this.operatorParser;
                    } else {
                        // One region for the whole operand list, so a resumed parse keeps what it already read.
                        this.operandsParser ??= new OperandsParser(
                            this.params,
                            i,
                            this.columnParser.baseCellDataType,
                            this.columnParser.column,
                            this.operatorParser.expectedNumOperands
                        );
                        parser = this.operandsParser;
                    }
                    this.parser = parser;
                }
                const hasCompletedOnPrevChar = this.parser.parse(char, i);
                if (hasCompletedOnPrevChar != null) {
                    if (this.isComplete()) {
                        return this.returnEndPosition(hasCompletedOnPrevChar ? i - 1 : i, true);
                    }
                    this.parser = undefined;
                    this.isAwaiting = true;
                }
            }
            i++;
        }
        this.parser?.complete?.(i - 1);
        return this.returnEndPosition(i);
    }

    public isValid(): boolean {
        // Every parser that can be invalid reports a message when it is, so the one error source decides.
        return this.isComplete() && this.getValidationError() == null;
    }

    public getValidationError(): FilterExpressionValidationError | null {
        const validationError =
            this.columnParser?.getValidationError() ??
            this.operatorParser?.getValidationError() ??
            this.operandsParser?.getValidationError();
        if (validationError) {
            return validationError;
        }
        const endPosition = this.params.expression.length;
        let translateKey: keyof typeof ADVANCED_FILTER_LOCALE_TEXT | undefined;
        if (!this.columnParser) {
            translateKey = 'advancedFilterValidationMissingColumn';
        } else if (!this.operatorParser) {
            translateKey = 'advancedFilterValidationMissingOption';
        } else if (this.operatorParser.expectedNumOperands && !this.operandsParser) {
            translateKey = 'advancedFilterValidationMissingValue';
        }
        if (translateKey) {
            return {
                message: this.params.advFilterExpSvc.translate(translateKey),
                startPosition: endPosition,
                endPosition,
            };
        }
        return null;
    }

    public getFunction(params: FilterExpressionFunctionParams): FilterExpressionFunction {
        const columnParser = this.columnParser!;
        const colId = columnParser.getColId();
        const { operators, evaluatorParams, operands } = params;
        const advFilterExpSvc = this.params.advFilterExpSvc;
        const operatorIndex = addToListAndGetIndex(
            operators,
            advFilterExpSvc.getExpressionOperator(
                columnParser.baseCellDataType,
                this.operatorParser?.getOperatorKey(),
                columnParser.column
            )
        );
        const evaluatorParamsIndex = addToListAndGetIndex(
            evaluatorParams,
            advFilterExpSvc.getExpressionEvaluatorParams(colId)
        );
        const [from, to] = this.getOperandParsers();
        const fromIndex = from ? addToListAndGetIndex(operands, this.getOperandValue(from)) : -1;
        const toIndex = to ? addToListAndGetIndex(operands, this.getOperandValue(to)) : -1;
        return (expressionProxy, node, p) =>
            p.operators[operatorIndex].evaluator(
                expressionProxy.getValue(colId, node),
                node,
                p.evaluatorParams[evaluatorParamsIndex],
                fromIndex < 0 ? undefined : p.operands[fromIndex],
                toIndex < 0 ? undefined : p.operands[toIndex]
            );
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams | undefined {
        if (this.isColumnPosition(position)) {
            return this.getColumnAutocompleteListParams(position);
        }
        if (this.isOperatorPosition(position)) {
            return this.getOperatorAutocompleteListParams(position);
        }
        if (this.isBeyondEndPosition(position)) {
            return undefined;
        }
        return { enabled: false };
    }

    public updateExpression(
        position: number,
        updateEntry: AutocompleteEntry,
        type?: string
    ): AutocompleteUpdate | null {
        const { expression } = this.params;
        const columnParser = this.columnParser;
        if (this.isColumnPosition(position)) {
            return updateExpression(
                expression,
                this.startPosition,
                columnParser?.getColId()
                    ? columnParser.endPosition!
                    : findEndPosition(expression, position).endPosition,
                this.params.advFilterExpSvc.getColumnValue(updateEntry),
                true
            );
        }
        if (!this.isOperatorPosition(position)) {
            return null;
        }

        const baseCellDataType = this.getBaseCellDataTypeFromOperatorAutocompleteType(type);
        const numOperands = this.getNumOperandsFor(baseCellDataType, updateEntry.key);
        const hasOperand = numOperands > 0;
        const operatorParser = this.operatorParser;
        // A point insert by default, for a caret between spaces; only one at or past the operator replaces.
        let startPosition = position;
        let endPosition = position;
        let empty = false;
        if (operatorParser?.startPosition == null || position >= operatorParser.startPosition) {
            if (operatorParser?.getOperatorKey()) {
                endPosition = operatorParser.endPosition!;
            } else {
                const found = findEndPosition(expression, position, true, true);
                endPosition = found.endPosition;
                empty = found.isEmpty;
            }
            startPosition = findStartPosition(expression, columnParser!.endPosition! + 1, endPosition);
        }
        const update = updateExpression(
            expression,
            startPosition,
            endPosition,
            updateEntry.displayValue ?? updateEntry.key,
            hasOperand,
            hasOperand && this.doesOperandNeedQuotes(baseCellDataType),
            empty,
            numOperands > 1
        );
        return { ...update, hideAutocomplete: !hasOperand };
    }

    public getModel(forBuilder?: boolean): AdvancedFilterModel {
        const columnParser = this.columnParser!;
        const [from, to] = this.getOperandParsers();
        const operands: ColumnFilterModelOperands = {};
        if (from) {
            operands.filter = forBuilder ? from.getBuilderValue() : from.getModelValue();
        }
        if (to) {
            operands.filterTo = forBuilder ? to.getBuilderValue() : to.getModelValue();
        }
        // The parse decides the member by `filterType`, which the union itself cannot express.
        return {
            filterType: columnParser.baseCellDataType,
            colId: columnParser.getColId(),
            type: this.operatorParser!.getOperatorKey(),
            ...operands,
        } as AdvancedFilterModel;
    }

    private getOperandValue(operandParser: OperandParser): any {
        const { baseCellDataType, column } = this.columnParser!;
        const operand = this.operandValueGetters[baseCellDataType](operandParser.getRawValue());
        if (baseCellDataType === 'dateString' || baseCellDataType === 'dateTimeString') {
            return this.params.dataTypeSvc?.getDateParserFunction(column)(operand as string) ?? operand;
        }
        return operand;
    }

    private getOperandParsers(): OperandParser[] {
        return this.operandsParser?.getParsers() ?? [];
    }

    private isComplete(): boolean {
        const operatorParser = this.operatorParser;
        return !!operatorParser && (!operatorParser.expectedNumOperands || !!this.operandsParser?.isComplete());
    }

    private isColumnPosition(position: number): boolean {
        return this.columnParser?.endPosition == null || position <= this.columnParser.endPosition + 1;
    }

    private isOperatorPosition(position: number): boolean {
        return this.operatorParser?.endPosition == null || position <= this.operatorParser.endPosition + 1;
    }

    private isBeyondEndPosition(position: number): boolean {
        return (
            this.isComplete() &&
            this.endPosition != null &&
            position > this.endPosition + 1 &&
            this.endPosition + 1 < this.params.expression.length
        );
    }

    private returnEndPosition(returnPosition: number, treatAsEnd?: boolean): number {
        this.endPosition = treatAsEnd ? returnPosition : returnPosition - 1;
        return returnPosition;
    }

    private getColumnAutocompleteListParams(position: number): AutocompleteListParams {
        return this.params.advFilterExpSvc.generateAutocompleteListParams(
            this.params.advFilterExpSvc.getColumnAutocompleteEntries(),
            'column',
            this.getColumnSearchString(position)
        );
    }

    private getColumnSearchString(position: number): string {
        const columnName = this.columnParser?.getDisplayValue() ?? '';
        const searchString = getSearchString(
            columnName,
            position,
            this.columnParser?.endPosition == null ? this.params.expression.length : this.columnParser.endPosition + 1
        );
        const containsStartChar = this.columnParser?.hasStartChar && searchString.length > 0;
        const containsEndChar = this.columnParser?.hasEndChar && searchString.length === columnName.length + 2;
        if (containsStartChar) {
            return searchString.slice(1, containsEndChar ? -1 : undefined);
        }
        return searchString;
    }

    private getOperatorAutocompleteListParams(position: number): AutocompleteListParams {
        const column = this.columnParser?.column;
        if (!column) {
            return { enabled: false };
        }

        const baseCellDataType = this.columnParser!.baseCellDataType;
        const searchString =
            this.operatorParser?.startPosition != null && position < this.operatorParser.startPosition
                ? ''
                : getSearchString(
                      this.operatorParser?.getDisplayValue() ?? '',
                      position,
                      this.operatorParser?.endPosition == null
                          ? this.params.expression.length
                          : this.operatorParser.endPosition + 1
                  );
        return this.params.advFilterExpSvc.generateAutocompleteListParams(
            this.params.advFilterExpSvc.getOperatorAutocompleteEntries(column, baseCellDataType),
            `operator-${baseCellDataType}`,
            searchString
        );
    }

    private getBaseCellDataTypeFromOperatorAutocompleteType(type?: string): BaseCellDataType | undefined {
        return type?.replace('operator-', '') as BaseCellDataType;
    }

    private getNumOperandsFor(baseCellDataType: BaseCellDataType | undefined, operator: string): number {
        if (!baseCellDataType || !operator) {
            return 1;
        }
        const column = this.columnParser?.column;
        return this.params.advFilterExpSvc.getExpressionOperator(baseCellDataType, operator, column)?.numOperands ?? 0;
    }

    private doesOperandNeedQuotes(baseCellDataType?: BaseCellDataType): boolean {
        return baseCellDataType !== 'number' && baseCellDataType !== 'bigint';
    }
}

function addToListAndGetIndex<T>(list: T[], value: T): number {
    return list.push(value) - 1;
}
