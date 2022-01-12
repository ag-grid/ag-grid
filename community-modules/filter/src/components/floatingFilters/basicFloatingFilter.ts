import { ExpressionComponentParams, PartialStateType, ScalarOperationExpression, TextOperationExpression } from '../../interfaces';
import { NO_OP_SERIALISER, NUMBER_SERIALISER } from '../operandSerialisers';
import { TextOperandComponent } from '../textOperandComponent';
import { RootFloatingComponent } from '../rootFloatingComponent';
import { SingleOperandComponent } from '../singleOperandComponent';
import { MultiOperandComponent } from '../multiOperandComponent';

export class BasicFloatingFilter<E extends TextOperationExpression | ScalarOperationExpression> extends RootFloatingComponent<E> {
    public constructor(params: { type: E['type'] }) {
        super(
            [
                new SingleOperandComponent({
                    childComponent: new TextOperandComponent<E['type']>({
                        serialiser: params.type === 'text-op' ? NO_OP_SERIALISER :
                            params.type === 'number-op' ? NUMBER_SERIALISER :
                            params.type === 'date-op' ? NO_OP_SERIALISER :
                            (NO_OP_SERIALISER as any),
                        inputType: params.type === 'text-op' ? undefined :
                            params.type === 'number-op' ? 'number' :
                            params.type === 'date-op' ? 'date' :
                            undefined,
                    }),
                    operandIndex: 0,
                }),
                new MultiOperandComponent({
                    readOnly: true,
                }),
            ],
            params.type,
        );
    }

    public setParameters(params: ExpressionComponentParams<E>): void {
        super.setParameters(params);

        this.addDestroyFunc(
            this.stateManager.addUpdateListener(this, (state) => this.updateDisplayedChild(state)),
        );

        this.updateDisplayedChild(this.stateManager.getTransientExpression());
    }

    private updateDisplayedChild(state: E | PartialStateType<E> | null): void {
        const splitAt = 1;

        if ((state?.operands?.length || 0) <= splitAt) {
            this.childComponents.forEach((child, idx) => {
                child.setDisplayed(idx < splitAt);
            });
        } else {
            this.childComponents.forEach((child, idx) => {
                child.setDisplayed(idx >= splitAt);
            });
        }
    }
}
