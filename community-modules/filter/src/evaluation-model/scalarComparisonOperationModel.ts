import { IDateFilterParams, IScalarFilterParams, _ } from "@ag-grid-community/core";
import { comparisonOperationOperandCardinality, isScalarComparisonOperation, FilterEvaluationModel, OperandArray, ScalarComparisonOperation, ScalarOperationExpression, PartialTuple } from "../interfaces";
import { Comparator, FilterExpressionSerialiser } from "./interfaces";

type OperandExpressionType<T extends number | Date> = T extends number ? number : string;

export class ScalarComparisonOperationModel<T extends number | Date> implements FilterEvaluationModel<T> {
    private readonly type: ScalarOperationExpression['type'];
    private readonly operation: ScalarComparisonOperation;
    private readonly operands: PartialTuple<OperandArray<T>>;
    private readonly comparator: Comparator<T>;
    private readonly operandSerialiser: FilterExpressionSerialiser<T, OperandExpressionType<T>>;
    private readonly typePredicate: (v: any) => boolean;
    private readonly filterParams?: IScalarFilterParams;

    public constructor(opts: {
        type?: ScalarOperationExpression['type'],
        operation?: ScalarComparisonOperation,
        operands?: PartialTuple<OperandArray<OperandExpressionType<T>>>,
        comparator: Comparator<T>,
        operandSerialiser: FilterExpressionSerialiser<T, OperandExpressionType<T>>,
        filterParams?: IScalarFilterParams,
    }) {
        this.type = opts.type || 'number-op';
        this.operation = opts.operation || 'equals';
        this.operands = opts.operands?.map(o => opts.operandSerialiser.toEvaluationModel(o)) as OperandArray<T> || [];
        this.comparator = opts.comparator;
        this.operandSerialiser = opts.operandSerialiser;
        this.filterParams = opts.filterParams;

        this.typePredicate = (v: any) => {
            return this.type === 'number-op' ?
                typeof v === 'number' : 
                v instanceof Date;
        };
    }

    public evaluate(input: T): boolean {
        if (!this.typePredicate(input)) {
            throw new Error('AG-Grid - Row value to evaluate isn\'t expected type: ' + input)
        }

        const comparisons = this.operands.map((v) => this.comparator.compare(v, input));

        switch (this.operation) {
            case 'equals':
                return comparisons[0] === 0;
            case "not-equals":
                return comparisons[0] !== 0;
            case "greater-than":
                return comparisons[0] > 0;
            case "less-than":
                return comparisons[0] < 0;
            case "in-range":
                return comparisons[0] >= 0 && comparisons[1] <= 0;
            default:
                throw new Error('AG Grid: Unknown operation: ' + this.operation);
        }
    }

    public isValid(): boolean {
        if (!isScalarComparisonOperation(this.operation)) { return false; }
        if (comparisonOperationOperandCardinality(this.operation) !== this.operands.length) { return false; }
        if (this.operands.some(o => o == null)) { return false; }

        if (this.operands.some(v => !this.typePredicate(v))) { return false; }

        return true;
    }

    public isNull(): boolean {
        if (this.isValid()) { return false; }

        return !this.operands.some(o => o != null);
    }

    public toFilterExpression(): ScalarOperationExpression {
        return {
            type: this.type,
            operation: this.operation,
            operands: this.operands.map((o) => this.operandSerialiser.toExpression(o)) as OperandArray<OperandExpressionType<T>>,
        } as ScalarOperationExpression;
    }
}
