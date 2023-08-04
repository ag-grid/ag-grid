
import { AdvancedFilterModel, AutocompleteEntry, AutocompleteListParams, BaseCellDataType, Column } from "@ag-grid-community/core";
import {
    AutocompleteUpdate,
    checkAndUpdateExpression,
    FilterExpressionParserParams,
    getSearchString,
    findStartAndUpdateExpression,
    updateExpression,
    escapeQuotes,
} from "./filterExpressionUtils";

interface Parser {
    type: string;
    parse(char: string, position: number): boolean | undefined;
    complete(position: number): void;
}

class ColumnParser implements Parser {
    public readonly type = 'column';

    public valid = true;
    public endPosition: number | undefined;
    public baseCellDataType: BaseCellDataType;
    public hasStartChar = false;
    public hasEndChar = false;
    private colName: string = '';
    private colId: string;

    constructor(
        private params: FilterExpressionParserParams,
        public readonly startPosition: number
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (char === ColFilterExpressionParser.COL_START_CHAR && !this.colName) {
            this.hasStartChar = true;
        } else if (char === ColFilterExpressionParser.COL_END_CHAR && this.hasStartChar) {
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
        return (this.hasStartChar ? ColFilterExpressionParser.COL_START_CHAR : '') +
            this.colName +
            (this.hasEndChar ? ColFilterExpressionParser.COL_END_CHAR : '');
    }

    public getColId(): string {
        return this.colId;
    }

    public complete(position: number): void {
        this.parseColumn(true, position);
    }

    private parseColumn(fromComplete: boolean, endPosition: number): boolean {
        this.endPosition = endPosition;
        const colValue = this.params.colIdResolver(this.colName);
        if (colValue && this.hasStartChar) {
            this.colId = colValue.colId;
            checkAndUpdateExpression(this.params, this.colName, colValue.columnName, endPosition - 1);
            this.colName = colValue.columnName;
            const column = this.params.columnModel.getGridColumn(this.colId);
            if (column) {
                this.baseCellDataType = this.params.dataTypeService.getBaseDataType(column) ?? 'text';
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
    public readonly type = 'operator';

    public valid = true;
    public endPosition: number | undefined;
    public expectedNumOperands: number = 0;
    private operator: string = '';
    private parsedOperator: string;

    constructor(
        private params: FilterExpressionParserParams,
        public readonly startPosition: number,
        private readonly baseCellDataType: BaseCellDataType
    ) {}

    public parse(char: string, position: number): boolean | undefined {
        if (char === ' ' || char === ')') {
            const isMultiPart = this.parseOperator(false, position - 1);
            if (isMultiPart) {
                this.operator += char;
            } else {
                return true;
            }
        } else {
            this.operator += char;
        }
        return undefined;
    }

    public complete(position: number): void {
        this.parseOperator(true, position);
    }

    public getDisplayValue(): string {
        return this.operator;
    }

    public getOperatorKey(): string {
        return this.parsedOperator;
    }

    private parseOperator(fromComplete: boolean, endPosition: number): boolean {
        const operatorForType = this.params.operators[this.baseCellDataType];
        const parsedOperator = operatorForType.findOperator(this.operator);
        this.endPosition = endPosition;
        if (parsedOperator) {
            this.parsedOperator = parsedOperator;
            const operator = operatorForType.operators[parsedOperator];
            this.expectedNumOperands = operator.numOperands;
            const operatorDisplayValue = operator.displayValue;
            checkAndUpdateExpression(this.params, this.operator, operatorDisplayValue, endPosition);
            this.operator = operatorDisplayValue;
            return false;
        } 
        if (fromComplete) {
            this.valid = false;
        }
        return parsedOperator === null; // is partial match
    }
}

class OperandParser implements Parser {
    public readonly type = 'operand';

    public valid = true;
    public endPosition: number | undefined;
    private quotes: `'` | `"` | undefined;
    private operand = '';
    private parsedOperand: string;

    constructor(
        private params: FilterExpressionParserParams,
        public readonly startPosition: number,
        private readonly baseCellDataType: BaseCellDataType
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
            if (this.baseCellDataType === 'number' || !this.quotes) {
                this.parseOperand(false, position - 1);
                return true;
            } else {
                this.operand += char;
            }
        } else if (!this.operand && !this.quotes && (char === `'` || char === `"`)) {
            this.quotes = char;
        } else if (this.quotes && char === this.quotes) {
            this.parseOperand(false, position);
            return false;
        } else {
            this.operand += char;
        }
        return undefined;
    }

    public complete(position: number): void {
        this.parseOperand(true, position);
    }

    public getRawValue(): string {
        return this.operand;
    }

    public getQuotedValue(): string {
        return this.parsedOperand;
    }

    private parseOperand(fromComplete: boolean, position: number): void {
        this.endPosition = position;
        if (fromComplete && this.quotes) {
            // missing end quote
            this.valid = false;
        }
        const escapeAndQuoteString = (operand: string) => `'${escapeQuotes(operand)}'`;
        let parser: (operand: string) => string;
        switch (this.baseCellDataType) {
            case 'number': {
                parser = operand => {
                    const value = parseFloat(operand);
                    if (isNaN(value)) {
                        this.valid = false;
                    }
                    return operand;
                }
                break;
            }
            default: {
                parser = operand => escapeAndQuoteString(operand);
                break;
            }
        }
        this.parsedOperand = parser(this.operand);
    }
}

export class ColFilterExpressionParser {
    public static readonly COL_START_CHAR = '[';
    public static readonly COL_END_CHAR = ']';

    private endPosition: number | undefined;
    private isAwaiting = true;
    private parser: Parser | undefined;
    private columnParser: ColumnParser | undefined;
    private operatorParser: OperatorParser | undefined;
    private operandParser: OperandParser | undefined;

    constructor(
        private params: FilterExpressionParserParams,
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
                        this.operatorParser = new OperatorParser(this.params, i, this.columnParser!.baseCellDataType);
                        parser = this.operatorParser;
                    } else {
                        this.operandParser = new OperandParser(this.params, i, this.columnParser!.baseCellDataType)
                        parser = this.operandParser;
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
        return this.isComplete() && this.columnParser!.valid && this.operatorParser!.valid && (!this.operandParser || this.operandParser!.valid);
    }

    public getFunction(): string {
        const colId = escapeQuotes(this.columnParser!.getColId());
        const operator = this.operatorParser?.getOperatorKey();
        const operand = this.operatorParser?.expectedNumOperands === 0 ? '' : `, ${this.operandParser!.getQuotedValue()}`;
        return `expressionProxy.operators.${this.columnParser!.baseCellDataType}.operators.${operator}.evaluator(expressionProxy.getValue('${colId}', node), node, expressionProxy.getParams('${colId}')${operand})`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams | undefined {
        if (this.isColumnPosition(position)) {
            return this.params.columnAutocompleteTypeGenerator(this.getColumnSearchString(position));
        }
        if (this.isOperatorPosition(position)) { return this.getOperatorAutocompleteListParams(position); }
        if (this.isBeyondEndPosition(position)) { return undefined; }
        return { enabled: false };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate | null {
        if (this.isColumnPosition(position)) {
            return updateExpression(
                this.params.expression,
                this.startPosition,
                this.getColumnEndPosition(position),
                this.params.columnValueCreator(updateEntry),
                true
            );
        } else if (this.isOperatorPosition(position)) {
            if (this.operatorParser?.startPosition != null && position < this.operatorParser.startPosition) {
                // in between multiple spaces, just insert direct
                return updateExpression(
                    this.params.expression,
                    position,
                    position,
                    updateEntry.displayValue ?? updateEntry.key,
                    true,
                    this.doesOperatorNeedQuotes(type, updateEntry.key)
                );
            }
            return findStartAndUpdateExpression(
                this.params.expression,
                this.columnParser!.endPosition! + 1,
                this.operatorParser?.endPosition ?? this.params.expression.length,
                updateEntry,
                true,
                this.doesOperatorNeedQuotes(type, updateEntry.key)
            );
        }
        return null;
    }

    public getModel(): AdvancedFilterModel {
        const colId = this.columnParser!.getColId();
        const model = {
            filterType: this.columnParser!.baseCellDataType,
            colId,
            type: this.operatorParser!.getOperatorKey(),
        };
        if (this.operatorParser!.expectedNumOperands) {
            const operandString = this.operandParser!.getRawValue();
            const operand = this.params.valueParserService.parseValue(this.params.columnModel.getGridColumn(colId)!, null, operandString, undefined);
            (model as any).filter = operand;
        }
        return model as AdvancedFilterModel;
    }

    private isComplete(): boolean {
        return !!(this.operatorParser && (!this.operatorParser.expectedNumOperands || (this.operatorParser.expectedNumOperands && this.operandParser)));
    }

    private isColumnPosition(position: number): boolean {
        return !this.columnParser || this.columnParser.endPosition == null || position <= this.columnParser.endPosition + 1;
    }

    private isOperatorPosition(position: number): boolean {
        return !this.operatorParser || this.operatorParser.endPosition == null || position <= this.operatorParser.endPosition + 1;
    }

    private isBeyondEndPosition(position: number): boolean {
        return this.isComplete() && this.endPosition != null && position > this.endPosition + 1 && this.endPosition + 1 < this.params.expression.length;
    }

    private returnEndPosition(returnPosition: number, treatAsEnd?: boolean): number {
        this.endPosition = treatAsEnd ? returnPosition : returnPosition - 1;
        return returnPosition;
    }

    private getColumnSearchString(position: number): string {
        const columnName = this.columnParser?.getDisplayValue() ?? '';
        const searchString = getSearchString(
            columnName,
            position,
            this.columnParser?.endPosition == null
                ? this.params.expression.length
                : (this.columnParser.endPosition + 1)
        );
        const containsStartChar = this.columnParser?.hasStartChar && searchString.length > 0;
        const containsEndChar = this.columnParser?.hasEndChar && searchString.length === columnName.length + 2;
        if (containsStartChar) {
            return searchString.slice(1, containsEndChar ? -1 : undefined);
        }
        return searchString;
    }

    private getColumnEndPosition(position: number): number {
        if (this.columnParser?.getColId()) {
            return this.columnParser.endPosition!;
        }
        const { expression } = this.params;
        if (position === expression.length || expression[position] === ' ') {
            return position - 1;
        }
        let endPosition = position;
        while (endPosition < expression.length) {
            const char = expression[endPosition];
            if (char === ' ') {
                endPosition = endPosition - 1;
                break;
            }
            endPosition++;
        }
        return endPosition;
    }

    private getOperatorAutocompleteListParams(position: number): AutocompleteListParams {
        const colId = this.columnParser?.getColId();
        const column = colId ? this.params.columnModel.getGridColumn(colId) : null;
        if (!column) {
            return { enabled: false };
        }

        const activeOperators = this.getActiveOperators(column);
        const baseCellDataType = this.columnParser!.baseCellDataType;
        const entries = this.params.operators[baseCellDataType].getEntries(activeOperators);
        const searchString = this.operatorParser?.startPosition != null && position < this.operatorParser.startPosition ? '' : getSearchString(
            this.operatorParser?.getDisplayValue() ?? '',
            position,
            this.operatorParser?.endPosition == null ? this.params.expression.length : (this.operatorParser.endPosition + 1)
        );
        return {
            enabled: true,
            type: `operator-${baseCellDataType}`,
            searchString,
            entries
        };
    }

    private getActiveOperators(column: Column): string[] | undefined {
        const filterOptions = column.getColDef().filterParams?.filterOptions;
        if (!filterOptions) { return undefined; }
        const isValid = filterOptions.every((filterOption: any) => typeof filterOption === 'string');
        return isValid ? filterOptions : undefined;
    }

    private doesOperatorNeedQuotes(type?: string, key?: string): boolean {
        const baseCellDataType = type?.replace('operator-', '') as BaseCellDataType;
        if (
            baseCellDataType === 'number' ||
            (baseCellDataType && key && this.params.operators[baseCellDataType]?.operators?.[key]?.numOperands === 0)
        ) {
            return false;
        }
        return true;
    }
}
