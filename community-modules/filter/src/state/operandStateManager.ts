import { ConcreteExpression, PartialStateType, StateManager } from "@ag-grid-community/core";

/** Adapts StateManager for the entire expression to be narrower-scoped for OperandComponents */
export class OperandStateManagerAdapter<E extends ConcreteExpression, O extends E['operands'][number]> implements StateManager<O> {
    public constructor(
        private readonly parent: StateManager<E>,
        private readonly operandIndex: number,
    ) {
    }

    public addUpdateListener(cb: (newState: O | null) => void): void {
        this.parent.addUpdateListener((pState: E) => {
            const update =  pState ? pState.operands[this.operandIndex] as O : null;
            cb(update);
        });
    }

    public addTransientUpdateListener(cb: (newTransientState: PartialStateType<O> | O | null) => void): void {
        this.parent.addTransientUpdateListener((pState) => {
            const update =  pState?.operands?.[this.operandIndex] as O || null;
            cb(update);
        });
    }

    public mutateTransientExpression(change: PartialStateType<O>): void {
        const operands = [ ...(this.parent.getTransientExpression()?.operands || []) ];
        operands[this.operandIndex] = change as O;
        this.parent.mutateTransientExpression({
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

    public applyExpression(): void {
        this.parent.applyExpression();
    }

    public revertToAppliedExpression(): void {
        this.parent.revertToAppliedExpression();
    }
}
