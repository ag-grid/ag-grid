import { LogScale } from "../../scale/logScale";
import { NumberAxis } from "./numberAxis";

export class LogAxis extends NumberAxis {
    static className = 'LogAxis';
    static type = 'log';

    constructor() {
        super();

        this.scale = new LogScale();
    }
}