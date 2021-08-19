import { Path } from "../../../../../scene/shape/path";
export declare abstract class OHLC extends Path {
    protected _date: number;
    date: number;
    protected _open: number;
    open: number;
    protected _high: number;
    high: number;
    protected _low: number;
    low: number;
    protected _close: number;
    close: number;
    protected _width: number;
    width: number;
    updatePath(): void;
}
