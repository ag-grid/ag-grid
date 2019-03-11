import {Axis} from "../../axis";
import linearScale from "../../scale/linearScale";

export class NumberAxis extends Axis<number> {
    constructor() {
        super(linearScale());
    }

}
