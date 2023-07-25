import { AutocompleteEntry, AutocompleteListParams, AutocompleteUpdate } from "../../widgets/autocompleteParams";
import { ColExpressionParser } from "./colExpressionParser";
import { ExpressionParserParams, getSearchString, updateExpressionByWord } from "./expressionUtils";

export class JoinExpressionParser {
    private valid: boolean = true;
    private expectingExpression: boolean = true;
    private expectingOperator: boolean = false;
    private startedOperator: boolean = false;
    private expressionParsers: (JoinExpressionParser | ColExpressionParser)[] = [];
    private operators: string[] = [];
    private parsedOperators: string[] = [];
    private operatorEndPositions: (number | undefined)[] = [];
    private activeOperator: number = 0;

    constructor(
        private params: ExpressionParserParams,
        public readonly startPosition: number
    ) {}

    public parseExpression(): number {
        let i = this.startPosition;
        const { expression } = this.params;
        while (i < expression.length) {
            const char = expression[i];
            if (char === '(') {
                const nestedParser = new JoinExpressionParser(this.params, i + 1);
                i = nestedParser.parseExpression();
                this.expressionParsers.push(nestedParser);
                this.expectingExpression = false;
                this.expectingOperator = true;
            } else if (char === ')') {
                return i;
            } else if (char === ' ') {
                if (this.expectingOperator) {
                    if (this.startedOperator) {
                        this.expectingOperator = false;
                        this.startedOperator = false;
                        this.expectingExpression = true;
                        this.parseOperator();
                        this.operatorEndPositions[this.activeOperator] = i - 1;
                        this.activeOperator++;
                    }
                }
            } else if (this.expectingExpression) {
                const nestedParser = new ColExpressionParser(this.params, i);
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

    public getExpression(): string {
        const hasMultipleExpressions = this.expressionParsers.length > 1;
        let expression = hasMultipleExpressions ? '(' : '';
        this.expressionParsers.forEach((expressionParser, index) => {
            expression += expressionParser.getExpression();
            if (index < this.expressionParsers.length - 1 && index < this.parsedOperators.length) {
                expression += ` ${this.parsedOperators[index]} `;
            }
        });
        return hasMultipleExpressions ? expression + ')' : expression;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        if (!this.expressionParsers.length) {
            return this.params.columnAutocompleteTypeGenerator('');
        }

        const expressionParserIndex = this.getExpressionParserIndex(position);

        if (expressionParserIndex == null) {
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
            return this.getJoinOperatorAutocompleteType(position);
        }

        return autocompleteType;
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry): AutocompleteUpdate {
        const expression = this.params.expression;

        const expressionParserIndex = this.getExpressionParserIndex(position);

        if (expressionParserIndex == null) {
            // positioned before the expression
            const updatedValuePart = updateEntry.displayValue ?? updateEntry.key;
            return { updatedValue: `${updatedValuePart} ${expression}`, updatedPosition: updatedValuePart.length };
        }

        const expressionParser = this.expressionParsers[expressionParserIndex];

        const updatedExpression = expressionParser.updateExpression(position, updateEntry);

        if (updatedExpression == null) {
            // beyond the end of the expression, just do simple update
            return updateExpressionByWord(this.params.expression, position, updateEntry);
        }
        return updatedExpression;
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

    private parseOperator(): void {
        let parsedValue = this.operators[this.activeOperator];
        switch (parsedValue) {
            case 'and': {
                parsedValue = '&&';
                break;
            }
            case 'or': {
                parsedValue = '||';
                break;
            }
            default: {
                this.valid = false;
            }
        }
        this.parsedOperators.push(parsedValue);
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
        return {
            enabled: true,
            type: 'join',
            searchString,
            entries: [
                {
                    key: 'and',
                },
                {
                    key: 'or',
                }
            ]
        };
    }
}
