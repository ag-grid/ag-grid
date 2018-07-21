import {BaseStatusBarComponent} from "./baseStatusBarComponent";

export class SumAggregationComp extends BaseStatusBarComponent {

    constructor() {
        super("sum", "Sum");
    }

    public setValue(value: number): void {
        super.setValue(value);
    }
}