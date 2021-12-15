import { TextOperationExpression, TEXT_COMPARISON_OPERATION_METADATA } from '@ag-grid-community/core';
import { ComparisonOperationComponent } from '../comparisonOperationComponent';
import { RootComponent } from '../rootComponent';
import { NO_OP_SERIALISER } from '../operandSerialisers';
import { TextOperandComponent } from '../textOperandComponent';

const OPERAND_OPTS = {
    serialiser: NO_OP_SERIALISER,
};

export class TextFilter extends RootComponent<TextOperationExpression> {
    public constructor() {
        super(
            [
                new ComparisonOperationComponent({
                    childComponents: [
                        new TextOperandComponent(OPERAND_OPTS),
                        new TextOperandComponent(OPERAND_OPTS),
                    ],
                    operationMetadata: TEXT_COMPARISON_OPERATION_METADATA,
                }),
            ],
            'text-op',
        );
    }
}
