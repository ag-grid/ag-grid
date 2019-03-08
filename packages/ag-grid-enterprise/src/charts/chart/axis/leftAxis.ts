// All chart axes may have:
// - fields (the names of the fields that should be mapped along the axis)
// - a title
// - visible range (in the [0,1] interval, which represents the slice of the domain
//   of the axis' scale)

// import {Axis} from "../../axis";
import {AxisType, ChartAxis, Direction} from "./chartAxis";
import {Axis} from "../../axis";
import scaleLinear from "../../scale/linearScale";
import {BandScale} from "../../scale/bandScale";

export class LeftAxis extends ChartAxis {
    private axis: Axis<any>;

    // Axes can have 'position' (left, bottom)
    // and 'type':
    // - numeric (linear, log and pow scales)
    // - category (band scale)
    // - time (time scale)

    constructor() {
        super();

        switch (this.type) {
            case AxisType.Linear:
                this.axis = new Axis(scaleLinear());
                break;
            case AxisType.Band:
                this.axis = new Axis(new BandScale<string>());
                break;
        }
    }

    get direction(): Direction {
        return Direction.Y;
    }
}
