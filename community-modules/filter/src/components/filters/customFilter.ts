import { CustomExpression } from "@ag-grid-community/core";
import { RootComponent } from "../rootComponent";
import { CustomExpressionComponent } from "../customExpressionComponent";

export class CustomFilter extends RootComponent<CustomExpression<unknown>> {
    public constructor() {
        super(
            [
                new CustomExpressionComponent(),
            ],
            'custom',
        );
    }
}
