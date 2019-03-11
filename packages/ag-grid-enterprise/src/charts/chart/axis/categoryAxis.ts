import {ChartAxis} from "./chartAxis";
import {BandScale} from "../../scale/bandScale";
import {Axis} from "../../axis";

export class CategoryAxis extends Axis<string> {
    constructor() {
        super(new BandScale<string>());
    }
}
