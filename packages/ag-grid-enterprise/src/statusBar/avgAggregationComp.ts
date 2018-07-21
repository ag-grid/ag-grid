import {BaseStatusBarComponent} from "./baseStatusBarComponent";

export class CountAggregationComp extends BaseStatusBarComponent {

    constructor() {
        super("count", "Count");
    }

    public setValue(value: number): void {
        super.setValue(value);
    }
}