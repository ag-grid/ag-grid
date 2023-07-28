import { AutocompleteEntry, AutocompleteListParams } from "../../widgets/autocompleteParams";
import { ColFilterExpressionParser } from "./colFilterExpressionParser";
import { AdvancedFilterModel } from "./filterExpressionModel";
import { AutocompleteUpdate, checkAndUpdateExpression, FilterExpressionParserParams, getSearchString, updateExpressionByWord } from "./filterExpressionUtils";

export class JoinFilterExpressionParser {
    private valid: boolean = true;
    private expectingExpression: boolean = true;
    private expectingOperator: boolean = false;
    private startedOperator: boolean = false;
    private expressionParsers: (JoinFilterExpressionParser | ColFilterExpressionParser)[] = [];
    private operators: string[] = [];
    private parsedOperator: 'and' | 'or';
    private operatorEndPositions: (number | undefined)[] = [];
    private activeOperator: number = 0;
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
                if (this.expectingOperator) {
                    if (this.startedOperator) {
                        this.expectingOperator = false;
                        this.startedOperator = false;
                        this.expectingExpression = true;
                        this.parseOperator(i - 1);
                        this.activeOperator++;
                    }
                }
            } else if (this.expectingExpression) {
                const nestedParser = new ColFilterExpressionParser(this.params, i);
                i = nestedParser.parseExpression();
                this.expressionParsers.push(nestedParser);
                this.expectingExpression = false;
                this.expectingOperator = true;
            } else if (this.expectingOperator) {
                if (!this.startedOperator) {
                    this.operators.push('');
                    this.operatorEndPositions.push(undefined);
                }
                this.startedOperator = true;
                this.operators[this.activeOperator] += char;
            }
            i++;
        }

        return i;
    }

    public isValid(): boolean {
        return this.valid &&
            this.expressionParsers.every(expressionParser => expressionParser.isValid()) &&
            this.expressionParsers.length === this.operators.length + 1;
    }

    public getFunction(): string {
        const hasMultipleExpressions = this.expressionParsers.length > 1;
        const expression = this.expressionParsers.map(
            expressionParser => expressionParser.getFunction()).join(` ${this.parsedOperator === 'or' ? '||' : '&&'} `
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
                return this.getJoinOperatorAutocompleteType(position, expressionParserIndex);
            }
            if (this.expressionParsers.length === this.operators.length) {
                const operatorEndPosition = this.operatorEndPositions[this.operatorEndPositions.length - 1];
                return operatorEndPosition == null || position <= operatorEndPosition + 1
                    ? this.getJoinOperatorAutocompleteType(position, this.operators.length - 1)
                    : this.params.columnAutocompleteTypeGenerator('');
            }
            if (this.params.expression[position - 1] === ')') {
                return { enabled: false };
            }
            return this.getJoinOperatorAutocompleteType(position);
        }

        return autocompleteType;
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate {
        const expression = this.params.expression;

        const expressionParserIndex = this.getExpressionParserIndex(position);

        if (expressionParserIndex == null) {
            // positioned before the expression
            const updatedValuePart = updateEntry.displayValue ?? updateEntry.key;
            return { updatedValue: `${updatedValuePart} ${expression}`, updatedPosition: updatedValuePart.length };
        }

        const expressionParser = this.expressionParsers[expressionParserIndex];

        const updatedExpression = expressionParser.updateExpression(position, updateEntry, type);

        if (updatedExpression == null) {
            if (type === 'column') {
                // beyond the end of the expression, just do simple update
                return updateExpressionByWord(this.params.expression, position, {
                    key: updateEntry.key, displayValue: this.params.columnValueCreator(updateEntry)
                });    
            } else {
                let { expression } = this.params;
                if (expressionParserIndex === 0) {
                    // if first operator, need to update all others
                    for (let i = this.operatorEndPositions.length - 1; i > 0; i--) {
                        const operatorEndPosition = this.operatorEndPositions[i];
                        if (operatorEndPosition == null) { continue; }
                        expression = updateExpressionByWord(expression, operatorEndPosition, updateEntry).updatedValue;
                    }
                }
                return updateExpressionByWord(expression, position, updateEntry);
            }
        }
        return updatedExpression;
    }

    public getModel(): AdvancedFilterModel {
        if (this.expressionParsers.length > 1) {
            return {
                filterType: 'join',
                type: this.parsedOperator === 'or' ? 'OR' : 'AND',
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

    private parseOperator(endPosition: number): void {
        this.operatorEndPositions[this.activeOperator] = endPosition;
        const operator = this.operators[this.activeOperator];
        const value = operator?.toLocaleLowerCase();
        const entry = Object.entries(this.params.joinOperators).find(
            ([_key, displayValue]) => value === displayValue.toLocaleLowerCase()
        ) as ['and' | 'or', string] | undefined;
        const parsedValue = entry?.[0];
        const displayValue = entry?.[1];
        if (this.activeOperator) {
            if (parsedValue !== this.parsedOperator) {
                this.valid = false;
            } else if (operator !== displayValue) {
                checkAndUpdateExpression(this.params, operator, displayValue!, endPosition);
                this.operators[this.activeOperator];
            }
        } else {
            if (parsedValue) {
                this.parsedOperator = parsedValue;
                if (operator !== displayValue) {
                    checkAndUpdateExpression(this.params, operator, displayValue!, endPosition);
                    this.operators[this.activeOperator];
                }
            } else {
                this.valid = false;
            }
        }
    }

    private getJoinOperatorAutocompleteType(position: number, operatorIndex?: number): AutocompleteListParams {
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
}
