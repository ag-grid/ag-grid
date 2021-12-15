import { _, FilterEvaluationModel, PartialStateType } from "@ag-grid-community/core";
import { LogicOperation, LogicalOperationExpression, ConcreteExpression } from "@ag-grid-community/core";

export class LogicOperationModel<T> implements FilterEvaluationModel<T> {
    private readonly operation: LogicOperation;
    private readonly operands: FilterEvaluationModel<T>[];

    public constructor(opts: {
        operation?: LogicOperation,
        operands?: FilterEvaluationModel<T>[],
    }) {
        this.operation = opts.operation || 'and';
        this.operands = opts.operands || [];
    }

    public evaluate(input: T): boolean {
        switch (this.operation) {
            case "and":
                for (const operand of this.operands) {
                    if (!operand.evaluate(input)) {
                        return false;
                    }
                }
                return true;

            case "or":
                for (const operand of this.operands) {
                    if (operand.evaluate(input)) {
                        return true;
                    }
                }
                return false;

            case "not":
                for (const operand of this.operands) {
                    if (operand.evaluate(input)) {
                        return false;
                    }
                }
                return true;

            default:
                throw new Error('AG Grid: Unknown operations: ' + this.operation);
        }
    }

    public isValid(): boolean {
        if (this.operation === 'not' && this.operands.length !== 1) {
            return false;
        }

        for (const operand of this.operands) {
            if (!operand.isValid()) {
                return false;
            }
        }

        return true;
    }

    public isNull(): boolean {
        if (this.isValid()) { return false; }
        if (this.operands.length === 0) { return true; }

        return !this.operands.some(o => !o.isNull());
    }

    public toFilterExpression(): LogicalOperationExpression<ConcreteExpression> {
        return {
            type: 'logic',
            operation: this.operation,
            operands: this.operands.map(v => v.toFilterExpression()),
        } as LogicalOperationExpression<ConcreteExpression>;
    }
}