import { Node } from "./node";
import {chainObjects} from "../util/object";

export abstract class Shape extends Node {
    protected static defaults = chainObjects(null, {
        fillStyle: 'none',
        strokeStyle: 'none',
        lineWidth: 1
    });

    restoreOwnDefaults() {
        const defaults = (this.constructor as any).defaults;

        for (const property in defaults) {
            if (defaults.hasOwnProperty(property)) {
                (this as any)[property] = defaults[property];
            }
        }
    }

    restoreAllDefaults() {
        const defaults = (this.constructor as any).defaults;

        for (const property in defaults) {
            (this as any)[property] = defaults[property];
        }
    }

    private _fillStyle: string = Shape.defaults.fillStyle; //| CanvasGradient | CanvasPattern;
    set fillStyle(value: string) {
        this._fillStyle = value;
        this.dirty = true;
    }
    get fillStyle(): string {
        return this._fillStyle;
    }

    private _strokeStyle: string = Shape.defaults.strokeStyle;
    set strokeStyle(value: string) {
        this._strokeStyle = value;
        this.dirty = true;
    }
    get strokeStyle(): string {
        return this._strokeStyle;
    }

    private _lineWidth: number = Shape.defaults.lineWidth;
    set lineWidth(value: number) {
        this._lineWidth = value;
        this.dirty = true;
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
    }

    abstract isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
    abstract isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
}
