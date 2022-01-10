import { _ } from "@ag-grid-community/core";
import { comparisonOperationOperandCardinality, isTextComparisonOperation, FilterEvaluationModel, TextComparisonOperation, TextComparisonOperationExpression } from "../interfaces";

export class TextComparisonOperationModel implements FilterEvaluationModel<string> {
    private readonly operation: TextComparisonOperation;
    private readonly operands: (string | null)[];

    public constructor(opts: {
        operation?: TextComparisonOperation,
        operands?: (string | null)[],
    }) {
        this.operation = opts.operation || 'equals';
        this.operands = opts.operands || [];
    }

    public evaluate(input: string): boolean {
        const operand = this.operands[0];
        if (operand == null) { return false; }

        switch (this.operation) {
            case 'equals':
                return operand === input;
            case 'not-equals':
                return operand !== input;
            case 'contains':
                return input.indexOf(operand) >= 0;
            case 'not-contains':
                return input.indexOf(operand) < 0;
            case 'starts-with':
                return input.startsWith(operand);
            case 'ends-with':
                return input.endsWith(operand);
            default:
                throw new Error('AG Grid: Unknown operation: ' + this.operation);
        }
    }

    public isValid(): boolean {
        if (!isTextComparisonOperation(this.operation)) { return false; }
        if (comparisonOperationOperandCardinality(this.operation) !== this.operands.length) { return false; }
        if (this.operands.some((v) => v == null || v.trim().length === 0)) { return false; }

        return true;
    }

    public isNull(): boolean {
        if (this.isValid()) { return false; }

        return !this.operands.some(o => o != null && o.trim().length > 0);
    }

    public toFilterExpression(): TextComparisonOperationExpression<'text-op', string> {
        return {
            type: 'text-op',
            operation: this.operation,
            operands: this.operands,
        } as TextComparisonOperationExpression<'text-op', string>;
    }
}