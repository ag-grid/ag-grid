import { SetExpression } from "@ag-grid-community/core";
import { RootComponent } from "../rootComponent";

export class SetFilter extends RootComponent<SetExpression> {
    public constructor() {
        super(
            [
            ],
            'set-op',
        );
    }
}
