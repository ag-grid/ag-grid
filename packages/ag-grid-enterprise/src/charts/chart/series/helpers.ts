import { LineSeries } from "./lineSeries";
import { BarSeries } from "./barSeries";
import { PieSeries } from "./pieSeries";

export function makeSeries(options?: any) {
    switch (options && options.type) {
        case 'line':
            return new LineSeries(options);
        case 'bar':
            return new BarSeries(options);
        case 'pie':
            return new PieSeries(options);
        default:
            return null;
    }
}

const pp = makeSeries();


