import { PartialStateType, ScalarOperationExpression, StateManager, TextOperationExpression } from "../interfaces";

/** Adapts StateManager for the entire expression to be narrower-scoped for OperandComponents */
export class OperandStateManagerAdapter<E extends TextOperationExpression | ScalarOperationExpression, O extends E['operands'][number]> implements StateManager<O> {
    public constructor(
        private readonly parent: StateManager<E>,
        private readonly operandIndex: number,
    ) {
    }

    public addUpdateListener(source: any, cb: (newState: O | null) => void): () => void {
        return this.parent.addUpdateListener(source, (pState: E) => {
            const update =  pState ? pState.operands[this.operandIndex] as O : null;
            cb(update);
        });
    }

    public addTransientUpdateListener(source: any, cb: (newTransientState: PartialStateType<O> | O | null) => void): () => void {
        return this.parent.addTransientUpdateListener(source, (pState) => {
            const update =  pState?.operands?.[this.operandIndex] as O || null;
            cb(update);
        });
    }

    public mutateTransientExpression(source: any, change: PartialStateType<O>): void {
        const operands = [ ...(this.parent.getTransientExpression()?.operands || []) ];
        operands[this.operandIndex] = change as O;
        this.parent.mutateTransientExpression(source, {
            operands,
        } as PartialStateType<E>);
    }

    public getTransientExpression(): PartialStateType<O> | null {
        const operand = this.parent.getTransientExpression()?.operands?.[this.operandIndex] as PartialStateType<O>;
        return operand != null ? operand : null;
    }

    public isTransientExpressionValid(): boolean {
        return this.parent.isTransientExpressionValid();
    }

    isTransientExpressionNull(): boolean {
        return this.parent.isTransientExpressionNull();
    }

    public applyExpression(source: any): void {
        this.parent.applyExpression(source);
    }

    public revertToAppliedExpression(source: any): void {
        this.parent.revertToAppliedExpression(source);
    }
}
