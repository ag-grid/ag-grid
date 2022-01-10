import { SetOperation, FilterEvaluationModel, SetOperationExpression, isSetOperation } from "../interfaces";
import { Comparator } from "./interfaces";

type SetOperationType = SetOperation;

export class SetOperationModel implements FilterEvaluationModel<string | number | null> {
    private readonly operation: SetOperationType;
    private readonly operands: SetOperationExpression['operands'];
    private readonly comparator: Comparator<string | number | null>;

    public constructor(opts: {
        operation?: SetOperationType,
        operands?: SetOperationExpression['operands'],
        comparator: Comparator<string | number | null>,
    }) {
        this.operation = opts.operation || 'in';
        this.operands = opts.operands || null;
        this.comparator = opts.comparator;
    }

    public evaluate(input: string): boolean {
        if (this.operands == null) { return true; }
        if (this.operands?.length === 0) { return false; }
        if (this.operation !== 'in') {
            throw new Error('AG Grid - Unknown set operation: ' + this.operation);
        }

        return this.operands.findIndex((v) => this.comparator.compare(v, input) === 0) >= 0;
    }

    public isValid(): boolean {
        if (!isSetOperation(this.operation)) { return false; }
        if (this.operands === null) { return true; }
        if (this.operands.length >= 0) { return true; }

        return false;
    }

    public isNull(): boolean {
        if (this.isValid()) { return false; }
        if (this.operands === null) { return true; }

        return false;
    }

    public toFilterExpression(): SetOperationExpression {
        return {
            type: 'set-op',
            operation: this.operation,
            operands: this.operands,
        };
    }
}