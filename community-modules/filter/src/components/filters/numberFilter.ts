import { NumberComparisonOperationExpression, SCALAR_COMPARISON_OPERATION_METADATA } from "../../interfaces";
import { ComparisonOperationComponent } from "../comparisonOperationComponent";
import { RootComponent } from "../rootComponent";
import { NUMBER_SERIALISER } from "../operandSerialisers";
import { TextOperandComponent } from "../textOperandComponent";

const OPERAND_OPTS = {
    serialiser: NUMBER_SERIALISER,
};

export class NumberFilter extends RootComponent<NumberComparisonOperationExpression> {
    public constructor() {
        super(
            [
                new ComparisonOperationComponent({
                    childComponents: [
                        new TextOperandComponent(OPERAND_OPTS),
                        new TextOperandComponent(OPERAND_OPTS),
                    ],
                    operationMetadata: SCALAR_COMPARISON_OPERATION_METADATA,
                }),
            ],
            'number-op',
        );
    }
}
