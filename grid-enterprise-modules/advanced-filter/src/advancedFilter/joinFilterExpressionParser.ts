import { AdvancedFilterModel, AutocompleteEntry, AutocompleteListParams } from "@ag-grid-community/core";
import { ColFilterExpressionParser } from "./colFilterExpressionParser";
import { findMatch } from "./filterExpressionOperators";
import {
    AutocompleteUpdate,
    checkAndUpdateExpression,
    FilterExpressionParserParams,
    getSearchString, updateExpression,
    findEndAndUpdateExpression
} from "./filterExpressionUtils";

class OperatorParser {
    private valid: boolean = true;
    private operators: string[] = [];
    private parsedOperator: 'and' | 'or';
    private operatorStartPositions: number[] = [];
    private operatorEndPositions: (number | undefined)[] = [];
    private activeOperator: number = 0;

    constructor(
        private params: FilterExpressionParserParams
    ) {}

    public parseExpression(i: number): number {
        this.operators.push('');
        this.operatorStartPositions.push(i);
        this.operatorEndPositions.push(undefined);
        const { expression } = this.params;
        while (i < expression.length) {
            const char = expression[i];
            if (char === ' ') {
                const isComplete = this.parseOperator(i - 1);
                if (isComplete) {
                    this.activeOperator++;
                    return i - 1;
                } else {
                    this.operators[this.activeOperator] += char;
                }
            } else {
                this.operators[this.activeOperator] += char;
            }
            i++;
        }

        return i;
    }

    public isValid(): boolean {
        return this.valid && !!this.parsedOperator;
    }

    public getFunction(): string {
        return this.parsedOperator === 'or' ? '||' : '&&';
    }

    public getModel(): 'AND' | 'OR' {
        return this.parsedOperator === 'or' ? 'OR' : 'AND';
    }

    public getAutocompleteListParams(position: number, operatorIndex?: number): AutocompleteListParams {
        let searchString: string;
        if (operatorIndex == null) {
            searchString = '';
        } else {
            const operator = this.operators[operatorIndex];
            const operatorEndPosition = this.operatorEndPositions[operatorIndex];
            searchString = getSearchString(
                operator,
                position,
                operatorEndPosition == null ? this.params.expression.length : (operatorEndPosition + 1)
            );
        }
        // if operator already chosen, don't allow other operators
        const entries = operatorIndex || (operatorIndex == null && this.activeOperator) ? [
            { key:  this.parsedOperator, displayValue: this.params.joinOperators[this.parsedOperator] }
        ] : [
            { key: 'and', displayValue: this.params.joinOperators.and },
            { key: 'or', displayValue: this.params.joinOperators.or }
        ];
        return {
            enabled: true,
            type: 'join',
            searchString,
            entries
        };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, operatorIndex: number): AutocompleteUpdate {
        let { expression } = this.params;
        if (operatorIndex === 0) {
            // need to update all others
            for (let i = this.operatorEndPositions.length - 1; i > 0; i--) {
                const operatorEndPosition = this.operatorEndPositions[i];
                if (operatorEndPosition == null) { continue; }
                expression = updateExpression(
                    expression,
                    this.operatorStartPositions[i],
                    operatorEndPosition,
                    updateEntry.displayValue ?? updateEntry.key
                ).updatedValue;
            }
        }
        return findEndAndUpdateExpression(expression,
            position,
            this.operatorStartPositions[operatorIndex],
            this.operatorEndPositions[operatorIndex],
            updateEntry,
            true
        );
    }

    public getNumOperators(): number {
        return this.operators.length;
    }

    public getLastOperatorEndPosition(): number | undefined {
        return this.operatorEndPositions[this.operatorEndPositions.length - 1];
    }

    private parseOperator(endPosition: number): boolean {
        const operator = this.operators[this.activeOperator];
        const parsedValue = findMatch(operator, this.params.joinOperators, v => v) as 'and' | 'or';
        if (parsedValue) {
            // exact match
            this.operatorEndPositions[this.activeOperator] = endPosition;
            const displayValue = this.params.joinOperators[parsedValue];
            if (this.activeOperator) {
                if (parsedValue !== this.parsedOperator) {
                    this.valid = false;
                    return false;
                }
            } else {
                this.parsedOperator = parsedValue;
            }
            if (operator !== displayValue) {
                checkAndUpdateExpression(this.params, operator, displayValue, endPosition);
                this.operators[this.activeOperator] = displayValue;
            }
            return true;
        } else if (parsedValue === null) {
            // partial match
            return false;
        } else {
            // no match
            this.valid = false;
            return true;
        }
    }
}

export class JoinFilterExpressionParser {
    private valid: boolean = true;
    private expectingExpression: boolean = true;
    private expectingOperator: boolean = false;
    private expressionParsers: (JoinFilterExpressionParser | ColFilterExpressionParser)[] = [];
    private operatorParser: OperatorParser = new OperatorParser(this.params);
    private endPosition: number;

    constructor(
        private params: FilterExpressionParserParams,
        public readonly startPosition: number
    ) {}

    public parseExpression(): number {
        let i = this.startPosition;
        const { expression } = this.params;
        while (i < expression.length) {
            const char = expression[i];
            if (char === '(') {
                const nestedParser = new JoinFilterExpressionParser(this.params, i + 1);
                i = nestedParser.parseExpression();
                this.expressionParsers.push(nestedParser);
                this.expectingExpression = false;
                this.expectingOperator = true;
            } else if (char === ')') {
                this.endPosition = i - 1;
                return i;
            } else if (char === ' ') {
                // ignore extra whitespace
            } else if (this.expectingExpression) {
                const nestedParser = new ColFilterExpressionParser(this.params, i);
                i = nestedParser.parseExpression();
                this.expressionParsers.push(nestedParser);
                this.expectingExpression = false;
                this.expectingOperator = true;
            } else if (this.expectingOperator) {
                i = this.operatorParser.parseExpression(i);
                this.expectingOperator = false;
                this.expectingExpression = true;
            }
            i++;
        }

        return i;
    }

    public isValid(): boolean {
        return this.valid &&
            this.expressionParsers.every(expressionParser => expressionParser.isValid()) &&
            this.operatorParser.isValid() &&
            this.expressionParsers.length === this.operatorParser.getNumOperators() + 1;
    }

    public getFunction(): string {
        const hasMultipleExpressions = this.expressionParsers.length > 1;
        const expression = this.expressionParsers.map(
            expressionParser => expressionParser.getFunction()).join(` ${this.operatorParser.getFunction()} `
        );
        return hasMultipleExpressions ? `(${expression})` : expression;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams | undefined {
        if (this.endPosition != null && position > this.endPosition) {
            return undefined
        }
        if (!this.expressionParsers.length) {
            return this.params.columnAutocompleteTypeGenerator('');
        }

        const expressionParserIndex = this.getExpressionParserIndex(position);

        if (expressionParserIndex == null) {
            if (this.params.expression[position] === '(') {
                return { enabled: false };
            }
            // positioned before the expression, so new expression
            return this.params.columnAutocompleteTypeGenerator('');
        }

        const expressionParser = this.expressionParsers[expressionParserIndex];

        const autocompleteType = expressionParser.getAutocompleteListParams(position);

        if (!autocompleteType) {
            // beyond the end of the expression
            if (expressionParserIndex! < this.expressionParsers.length - 1) {
                // in the middle of two expressions
                return this.operatorParser.getAutocompleteListParams(position, expressionParserIndex);
            }
            if (this.expressionParsers.length === this.operatorParser.getNumOperators()) {
                const operatorEndPosition = this.operatorParser.getLastOperatorEndPosition();
                return operatorEndPosition == null || position <= operatorEndPosition + 1
                    ? this.operatorParser.getAutocompleteListParams(position, this.operatorParser.getNumOperators() - 1)
                    : this.params.columnAutocompleteTypeGenerator('');
            }
            if (this.params.expression[position - 1] === ')') {
                return { enabled: false };
            }
            return this.operatorParser.getAutocompleteListParams(position);
        }

        return autocompleteType;
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        const expression = this.params.expression;

        const expressionParserIndex = this.getExpressionParserIndex(position);

        if (expressionParserIndex == null) {
            // positioned before the expression
            const updatedValuePart = type === 'column'
                ? this.params.columnValueCreator(updateEntry)
                : updateEntry.displayValue ?? updateEntry.key;
            return updateExpression(expression, 0, 0, updatedValuePart, true);
        }

        const expressionParser = this.expressionParsers[expressionParserIndex];

        const updatedExpression = expressionParser.updateExpression(position, updateEntry, type);

        if (updatedExpression == null) {
            if (type === 'column') {
                // beyond the end of the expression, just do simple update
                return updateExpression(expression, position, expression.length - 1, this.params.columnValueCreator(updateEntry), true); 
            } else {
                return this.operatorParser.updateExpression(position, updateEntry, expressionParserIndex);
            }
        }
        return updatedExpression;
    }

    public getModel(): AdvancedFilterModel {
        if (this.expressionParsers.length > 1) {
            return {
                filterType: 'join',
                type: this.operatorParser.getModel(),
                conditions: this.expressionParsers.map(parser => parser.getModel())
            };
        } else {
            return this.expressionParsers[0].getModel();
        }
    }

    private getExpressionParserIndex(position: number): number | undefined {
        let expressionParserIndex: number | undefined;

        for (let i = 0; i < this.expressionParsers.length; i++) {
            const expressionParserToCheck = this.expressionParsers[i];
            if (expressionParserToCheck.startPosition > position) {
                break;
            }
            expressionParserIndex = i;
        }

        return expressionParserIndex;
    }
}
