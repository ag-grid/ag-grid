import { Column } from "../../entities/column";
import { BaseCellDataType } from "../../entities/dataType";
import { AutocompleteEntry, AutocompleteListParams } from "../../widgets/autocompleteParams";
import { AdvancedFilterModel } from "./filterExpressionModel";
import { AutocompleteUpdate, FilterExpressionParserParams, getSearchString, updateExpression, updateExpressionFromStart } from "./filterExpressionUtils";

export class ColFilterExpressionParser {
    public static readonly COL_START_CHAR = '[';
    public static readonly COL_END_CHAR = ']';

    private valid: boolean = true;
    private complete: boolean = false;
    private endPosition: number | undefined;
    private expectingColumn: boolean = true;
    private startedColumn: boolean = false;
    private hasColumnStartChar: boolean = false;
    private columnEndPosition: number;
    private expectingOperator: boolean = false;
    private startedOperator: boolean = false;
    private operatorEndPosition: number;
    private activeOperand: number = -1;
    private startedOperand: boolean = false;
    private quotedOperand: boolean = false;
    private colName: string = '';
    private colId: string;
    private baseCellDataType: BaseCellDataType;
    private operator: string = '';
    private parsedOperator: string;
    private expectedNumOperands: number = 0;
    private operands: string[] = [];

    constructor(
        private params: FilterExpressionParserParams,
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
                        this.colName += char;
                    }
                } else if (this.expectingOperator) {
                    if (this.startedOperator) {
                        const isMultiPart = this.parseOperator(false, i - 1);
                        if (isMultiPart) {
                            this.operator += char;
                        } else {
                            this.expectingOperator = false;
                            if (this.expectedNumOperands > 0) {
                                this.activeOperand = 0;
                                this.operands.push('');
                            } else {
                                this.complete = true;
                                return this.returnEndPosition(i);
                            }
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
                this.onComplete(i - 1);
                return this.returnEndPosition(i - 1, true);
            } else if (char === ColFilterExpressionParser.COL_START_CHAR && this.expectingColumn) {
                // TODO - add handling for if [ or ] appear in the columns names
                this.startedColumn = true;
                this.hasColumnStartChar = true;
            } else if (char === ColFilterExpressionParser.COL_END_CHAR && this.hasColumnStartChar) {
                this.expectingColumn = false;
                this.expectingOperator = true;
                this.parseColumn(i);
            } else if ((char === `'` || char === `"`) && this.activeOperand >= 0) {
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
                this.colName += char;
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
        this.onComplete(i - 1);
        return this.returnEndPosition(i);
    }

    public isValid(): boolean {
        return this.valid && this.complete;
    }

    public getFunction(): string {
        const operands = this.expectedNumOperands === 0 ? '' : `, ${this.operands.join(', ')}`;
        return `expressionProxy.operators.${this.baseCellDataType}.operators.${this.parsedOperator}.evaluator(expressionProxy.getValue('${this.colId}', node), node, expressionProxy.getParams('${this.colId}')${operands})`;
    }

    public getAutocompleteListParams(position: number): AutocompleteListParams | undefined {
        if (this.isColumnPosition(position)) {
            return this.params.columnAutocompleteTypeGenerator(
                getSearchString(this.colName, position, this.columnEndPosition == null
                    ? this.params.expression.length
                    : (this.columnEndPosition + 1))
            );
        }
        if (this.isOperatorPosition(position)) { return this.getOperatorAutocompleteType(position); }
        if (this.isBeyondEndPosition(position)) { return undefined; }
        return { enabled: false };
    }

    public updateExpression(position: number, updateEntry: AutocompleteEntry): AutocompleteUpdate | null {
        if (this.isColumnPosition(position)) {
            return updateExpression(
                this.params.expression,
                this.startPosition,
                this.columnEndPosition ?? this.params.expression.length - 1,
                this.params.columnValueCreator(updateEntry)
            );
        } else if (this.isOperatorPosition(position)) {
            return updateExpressionFromStart(
                this.params.expression,
                this.columnEndPosition + 1,
                this.operatorEndPosition ?? this.params.expression.length,
                updateEntry
            );
        }
        return null;
    }

    public getModel(): AdvancedFilterModel {
        const model = {
            filterType: this.baseCellDataType,
            colId: this.colId,
            type: this.parsedOperator,
        };
        const unquote = (operand: string) => operand.slice(1, operand.length - 2);
        if (this.operands.length) {
            (model as any).filter = unquote(this.operands[0]);
        }
        return model as AdvancedFilterModel;
    }

    private isColumnPosition(position: number): boolean {
        return this.columnEndPosition == null || position <= this.columnEndPosition + 1;
    }

    private isOperatorPosition(position: number): boolean {
        return this.operatorEndPosition == null || position <= this.operatorEndPosition + 1;
    }

    private isBeyondEndPosition(position: number): boolean {
        return this.complete && this.endPosition != null && position > this.endPosition + 1 && this.endPosition + 1 < this.params.expression.length;
    }

    private parseColumn(endPosition: number): void {
        this.columnEndPosition = endPosition;
        const colValue = this.params.colIdResolver(this.colName);
        if (colValue) {
            this.colId = colValue.colId;
            this.checkAndUpdateExpression(this.colName, colValue.columnName, endPosition - 1);
            this.colName = colValue.columnName;
            const column = this.params.columnModel.getGridColumn(this.colId);
            if (column) {
                this.baseCellDataType = this.params.dataTypeService.getBaseDataType(column) ?? 'text';
                return;
            }
        }
        this.valid = false;
        this.baseCellDataType = 'text';
    }

    private parseOperator(isComplete: boolean, endPosition: number): boolean {
        const operatorForType = this.params.operators[this.baseCellDataType];
        const parsedOperator = operatorForType.findOperator(this.operator);
        if (parsedOperator) {
            this.operatorEndPosition = endPosition;
            this.parsedOperator = parsedOperator;
            this.expectedNumOperands = operatorForType.operators[parsedOperator].numOperands;
            const operatorDisplayValue = operatorForType.operators[parsedOperator].displayValue;
            this.checkAndUpdateExpression(this.operator, operatorDisplayValue, endPosition);
            this.operator = operatorDisplayValue;
            return false;
        } 
        if (isComplete) {
            this.valid = false;
        }
        return parsedOperator === null; // is partial match
    }

    private parseOperand(): void {
        // TODO escape quotes in string
        const escapeAndQuoteString = (operand: string) => `"${operand}"`;
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
        this.operands = this.operands.map(parser);
    }

    private checkAndUpdateExpression(userValue: string, displayValue: string, endPosition: number): void {
        if (displayValue !== userValue) {
            this.params.expression = updateExpression(
                this.params.expression,
                endPosition - userValue.length + 1,
                endPosition,
                displayValue
            ).updatedValue;
        }
    }

    private onComplete(endPosition: number): void {
        if (this.expectingOperator && this.startedOperator) {
            this.parseOperator(true, endPosition);
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
        const column = this.colId ? this.params.columnModel.getGridColumn(this.colId) : null;
        if (!column) {
            return { enabled: false };
        }

        const activeOperators = this.getActiveOperators(column);
        const entries = this.params.operators[this.baseCellDataType].getEntries(activeOperators);
        const searchString = getSearchString(
            this.operator,
            position,
            this.operatorEndPosition == null ? this.params.expression.length : (this.operatorEndPosition + 1)
        );
        return {
            enabled: true,
            type: `operator-${this.baseCellDataType}`,
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
}
