import { BaseCellDataType } from "../../entities/dataType";
import { ColumnModel } from "../../columns/columnModel";
import { DataTypeService } from "../../columns/dataTypeService";
import { AutocompleteEntry, AutocompleteListParams } from "./agAutocomplete";

interface Operator {
    getExpression(colValue: string, operands: string[]): string;
}

class DotOperator implements Operator {
    constructor(private operator: string) {}

    public getExpression(colValue: string, operands: string[]): string {
        return `${colValue}?.${this.operator}(${operands.join(', ')})`
    }
}

class SpaceOperator implements Operator {
    constructor(private operator: string) {}

    public getExpression(colValue: string, operands: string[]): string {
        return `${colValue} ${this.operator} ${operands[0]}`
    }
}

function getSearchString(value: string, position: number, endPosition: number): string {
    const numChars = endPosition - position;
    return numChars ? value.slice(0, value.length - numChars) : value;
}

interface ExpressionParams {
    expression: string;
    columnModel: ColumnModel;
    dataTypeService: DataTypeService;
    columnAutocompleteTypeGenerator: (searchString: string) => AutocompleteListParams;
}

export class ExpressionParser {
    private joinExpressionParser: JoinExpressionParser;
    private valid: boolean = false;

    constructor(private params: ExpressionParams) {}

    public parseExpression(): void {
        this.joinExpressionParser = new JoinExpressionParser(this.params, 0);
        const i = this.joinExpressionParser.parseExpression();
        this.valid = i >= this.params.expression.length - 1 && this.joinExpressionParser.isValid();
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getExpression(): string {
        return `return ${this.joinExpressionParser.getExpression()};`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        return this.joinExpressionParser.getAutocompleteListParams(position);
    }
}

class JoinExpressionParser {
    private valid: boolean = true;
    private expectingExpression: boolean = true;
    private expectingOperator: boolean = false;
    private startedOperator: boolean = false;
    private expressionParsers: (JoinExpressionParser | ColExpressionParser)[] = [];
    private operators: string[] = [];
    private activeOperator: number = -1;

    constructor(
        private params: ExpressionParams,
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
                this.activeOperator++;
            } else if (char === ')') {
                return i;
            } else if (char === ' ') {
                if (this.expectingOperator) {
                    if (this.startedOperator) {
                        this.expectingOperator = false;
                        this.startedOperator = false;
                        this.expectingExpression = true;
                        this.parseOperator();
                        this.activeOperator++;
                    }
                }
            } else if (this.expectingExpression) {
                const nestedParser = new ColExpressionParser(this.params, i);
                i = nestedParser.parseExpression();
                this.expressionParsers.push(nestedParser);
                this.expectingExpression = false;
                this.expectingOperator = true;
                this.activeOperator++;
            } else if (this.expectingOperator) {
                if (!this.startedOperator) {
                    this.operators.push('');
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
            if (index < this.expressionParsers.length - 1 && index < this.operators.length) {
                expression += ` ${this.operators[index]} `;
            }
        });
        return hasMultipleExpressions ? expression + ')' : expression;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams {
        if (!this.expressionParsers.length) {
            return this.params.columnAutocompleteTypeGenerator('');
        }
        
        let expressionParser: JoinExpressionParser | ColExpressionParser | undefined;
        let expressionParserIndex: number;

        for (let i = 0; i < this.expressionParsers.length; i++) {
            const expressionParserToCheck = this.expressionParsers[i];
            if (expressionParserToCheck.startPosition > position) {
                break;
            }
            expressionParser = expressionParserToCheck;
            expressionParserIndex = i;
        }

        if (!expressionParser) {
            // positioned before the expression, so new expression
            return this.params.columnAutocompleteTypeGenerator('');
        }

        const autocompleteType = expressionParser.getAutocompleteListParams(position);

        if (!autocompleteType) {
            // beyond the end of the expression
            if (expressionParserIndex! < this.expressionParsers.length - 1) {
                // in the middle of two expressions
                return this.getJoinOperatorAutocompleteType();
            }
            // TODO - need a check here whether the last character is an operator
            return this.expressionParsers.length === this.operators.length
                ? this.params.columnAutocompleteTypeGenerator('')
                : this.getJoinOperatorAutocompleteType();
        }

        return autocompleteType;
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
        this.operators[this.activeOperator] = parsedValue;
    }

    private getJoinOperatorAutocompleteType(): AutocompleteListParams {
        // TODO
        return {
            enabled: true,
            type: 'join',
            // TODO
            searchString: '',
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

class ColExpressionParser {
    private static readonly COL_START_CHAR = '[';
    private static readonly COL_END_CHAR = ']';

    private valid: boolean = true;
    private complete: boolean = false;
    private endPosition: number | undefined = undefined;
    private expectingColumn: boolean = true;
    private startedColumn: boolean = false;
    private quotedColumn: boolean = false;
    private columnEndPosition: number;
    private expectingOperator: boolean = false;
    private startedOperator: boolean = false;
    private operatorEndPosition: number;
    private activeOperand: number = -1;
    private startedOperand: boolean = false;
    private quotedOperand: boolean = false;
    private colId: string = '';
    private baseCellDataType: BaseCellDataType;
    private operator: string = '';
    private parsedOperator: Operator;
    private expectedNumOperands: number = 0;
    private operands: string[] = [];

    constructor(
        private params: ExpressionParams,
        public readonly startPosition: number
    ) {}

    public parseExpression(): number {
        let i = this.startPosition;
        const { expression } = this.params;
        while (i < expression.length) {
            const char = expression[i];
            if (char === ' ') {
                if (this.expectingColumn) {
                    if (this.startedColumn) {
                        if (this.quotedColumn) {
                            this.colId += char;
                        } else {
                            this.expectingColumn = false;
                            this.expectingOperator = true;
                            this.parseColumn();
                            this.columnEndPosition = i;
                        }
                    }
                } else if (this.expectingOperator) {
                    if (this.startedOperator) {
                        this.expectingOperator = false;
                        this.parseOperator();
                        this.operatorEndPosition = i;
                        if (this.expectedNumOperands > 0) {
                            this.activeOperand = 0;
                            this.operands.push('');
                        } else {
                            this.complete = true;
                            return this.returnEndPosition(i);
                        }
                    }
                } else if (this.activeOperand >= 0) {
                    if (this.startedOperand) {
                        if (this.quotedOperand) {
                            this.operands[this.activeOperand] += char;
                        } else {
                            if (this.onOperandComplete()) {
                                return this.returnEndPosition(i);
                            }
                        }
                    }
                }
            } else if (char === ')') {
                this.onComplete();
                return this.returnEndPosition(i - 1, true);
            } else if (char === ColExpressionParser.COL_START_CHAR && this.expectingColumn) {
                this.quotedColumn = true;
                this.startedColumn = true;
            } else if (char === ColExpressionParser.COL_END_CHAR && this.expectingColumn && this.quotedColumn) {
                this.expectingColumn = false;
                this.expectingOperator = true;
                this.parseColumn();
                this.columnEndPosition = i;
            } else if (char === `'` && this.activeOperand >= 0) {
                if (this.quotedOperand) {
                    if (this.onOperandComplete()) {
                        return this.returnEndPosition(i, true);
                    }
                    this.quotedOperand = false;
                } else {
                    this.quotedOperand = true;
                    this.startedOperand = true;
                }
            } else if (this.expectingColumn) {
                this.startedColumn = true;
                this.colId += char;
            } else if (this.expectingOperator) {
                this.startedOperator = true;
                this.operator += char;
            } else if (this.activeOperand >= 0) {
                this.startedOperand = true;
                this.operands[this.activeOperand] += char;
            } else {
                return this.returnEndPosition(i);
            }
            i++;
        }
        this.onComplete();
        return this.returnEndPosition(i);
    }

    public isValid(): boolean {
        return this.valid && this.complete;
    }

    public getExpression(): string {
        return this.parsedOperator?.getExpression(`valueService.getValue(columnModel.getGridColumn('${this.colId}'), node, true)`, this.operands) ?? '';
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams | undefined {
        if (this.columnEndPosition == null || position <= this.columnEndPosition) {
            return this.params.columnAutocompleteTypeGenerator(getSearchString(this.colId, position, this.columnEndPosition ?? this.params.expression.length));
        }
        if (this.operatorEndPosition == null || position <= this.operatorEndPosition) { return this.getOperatorAutocompleteType(position); }
        if (this.complete && this.endPosition != null && position > this.endPosition && this.endPosition + 1 < this.params.expression.length) { return undefined; }
        return { enabled: false };
    }

    private parseColumn(): void {
        const column = this.params.columnModel.getGridColumn(this.colId);
        if (!column) {
            this.valid = false;
            // TODO set this.baseCellDataType?
            return;
        }
        this.baseCellDataType = this.params.dataTypeService.getBaseDataType(column) ?? 'text';
    }

    private parseOperator(): void {
        // TODO - work out valid operators from data type
        switch (this.operator) {
            case '>':
            case '<': {
                this.expectedNumOperands = 1;
                this.parsedOperator = new SpaceOperator(this.operator);
                break;
            }
            case 'contains': {
                this.expectedNumOperands = 1;
                this.parsedOperator = new DotOperator('includes');
                break;
            }
            default: {
                this.valid = false;
                break;
            }
        }
    }

    private parseOperand(): void {
        if (this.baseCellDataType === 'text') {
            this.operands = this.operands.map(operand => `'${operand}'`);
        }
    }

    private onComplete(): void {
        if (this.expectingOperator && this.startedOperator) {
            this.parseOperator();
            if (this.expectedNumOperands > 0) {
                this.valid = false;
            } else {
                this.complete = true
            }
        } else if (this.activeOperand >= 0 && this.startedOperand) {
            this.parseOperand();
            if (this.activeOperand >= this.expectedNumOperands - 1) {
                this.complete = true;
            }
        } else {
            this.valid = false;
        }
    }

    private onOperandComplete(): boolean {
        this.parseOperand();
        this.activeOperand++;
        this.startedOperand = false;
        if (this.activeOperand >= this.expectedNumOperands) {
            this.activeOperand = -1;
            this.complete = true;
            return true;
        } else {
            this.operands.push('');
        }
        return false;
    }

    private returnEndPosition(returnPosition: number, treatAsEnd?: boolean): number {
        this.endPosition = treatAsEnd ? returnPosition : returnPosition - 1;
        return returnPosition;
    }

    private getOperatorAutocompleteType(position: number): AutocompleteListParams {
        let entries: AutocompleteEntry[];
        let type: string | undefined;
        if (this.baseCellDataType === 'number') {
            type = 'operator-number';
            entries = [{
                key: '<'
            }, {
                key: '>'
            }];
        } else if (this.baseCellDataType === 'text') {
            type = 'operator-text';
            entries = [{
                key: 'contains'
            }]
        } else {
            entries = [];
        }
        return {
            enabled: true,
            type,
            searchString: getSearchString(this.operator, position, this.operatorEndPosition ?? this.params.expression.length),
            entries
        };
    }
}
