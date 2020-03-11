import { Path } from "../../../../../scene/shape/path";
export declare abstract class OHLC extends Path {
    protected _date: number;
    set date(value: number);
    get date(): number;
    protected _open: number;
    set open(value: number);
    get open(): number;
    protected _high: number;
    set high(value: number);
    get high(): number;
    protected _low: number;
    set low(value: number);
    get low(): number;
    protected _close: number;
    set close(value: number);
    get close(): number;
    protected _width: number;
    set width(value: number);
    get width(): number;
    updatePath(): void;
}
