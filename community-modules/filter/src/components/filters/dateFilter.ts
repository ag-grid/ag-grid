import { DateComparisonOperationExpression, SCALAR_COMPARISON_OPERATION_METADATA } from "../../interfaces";
import { ComparisonOperationComponent } from "../comparisonOperationComponent";
import { RootComponent } from "../rootComponent";
import { NO_OP_SERIALISER } from "../operandSerialisers";
import { TextOperandComponent } from "../textOperandComponent";

const OPERAND_OPTS = {
    serialiser: NO_OP_SERIALISER,
    inputType: 'date',
};

export class DateFilter extends RootComponent<DateComparisonOperationExpression> {
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
            'date-op',
        );
    }
}
