import { Path } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";

export class RangeHandle extends Path {
    static className = 'RangeHandle';

    protected _fill = '#f2f2f2';
    protected _stroke = '#999999';
    protected _strokeWidth = 1;

    protected _centerX: number = 0;
    set centerX(value: number) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX(): number {
        return this._centerX;
    }

    protected _centerY: number = 0;
    set centerY(value: number) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY(): number {
        return this._centerY;
    }

    // Use even numbers for better looking results.
    protected _width: number = 8;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width(): number {
        return this._width;
    }

    protected _height: number = 16;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height(): number {
        return this._height;
    }

    computeBBox(): BBox {
        const { centerX, centerY, width, height } = this;
        const x = centerX - width / 2;
        const y = centerY - height / 2;

        return new BBox(x, y, width, height);
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();

        return bbox.containsPoint(point.x, point.y);
    }

    updatePath() {
        const { path, centerX, centerY, width, height } = this;
        const { alignment: a, align: al } = this;

        path.clear();

        const x = centerX - width / 2;
        const y = centerY - height / 2;

        const ax = al(a, x);
        const ay = al(a, y);
        const axw = ax + al(a, x, width);
        const ayh = ay + al(a, y, height);

        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);

        // Grip lines.
        path.moveTo(al(a, centerX - 1), al(a, centerY - 4));
        path.lineTo(al(a, centerX - 1), al(a, centerY + 4));
        path.moveTo(al(a, centerX + 1), al(a, centerY - 4));
        path.lineTo(al(a, centerX + 1), al(a, centerY + 4));
    }
}