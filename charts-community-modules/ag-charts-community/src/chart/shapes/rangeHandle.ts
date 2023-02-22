import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
import { ShapeLineCap } from '../../scene/shape/shape';
import { LINE_CAP, NUMBER, COLOR_STRING, Validate } from '../../util/validation';

export class RangeHandle extends Path {
    static className = 'RangeHandle';

    @Validate(COLOR_STRING)
    protected _fill = '#f2f2f2';

    @Validate(COLOR_STRING)
    protected _stroke = '#999999';

    @Validate(NUMBER(0))
    protected _strokeWidth = 1;

    @Validate(LINE_CAP)
    protected _lineCap = 'square' as ShapeLineCap;

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

    // Use an even number for better looking results.
    @Validate(NUMBER(0))
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

    // Use an even number for better looking results.
    @Validate(NUMBER(0))
    protected _gripLineGap: number = 2;
    set gripLineGap(value: number) {
        if (this._gripLineGap !== value) {
            this._gripLineGap = value;
            this.dirtyPath = true;
        }
    }
    get gripLineGap(): number {
        return this._gripLineGap;
    }

    // Use an even number for better looking results.
    @Validate(NUMBER(0))
    protected _gripLineLength: number = 8;
    set gripLineLength(value: number) {
        if (this._gripLineLength !== value) {
            this._gripLineLength = value;
            this.dirtyPath = true;
        }
    }
    get gripLineLength(): number {
        return this._gripLineLength;
    }

    @Validate(NUMBER(0))
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

    computeBBox() {
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

        path.clear();

        const x = centerX - width / 2;
        const y = centerY - height / 2;

        const ax = this.align(x);
        const ay = this.align(y);
        const axw = ax + this.align(x, width);
        const ayh = ay + this.align(y, height);

        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);

        // Grip lines.
        const dx = this.gripLineGap / 2;
        const dy = this.gripLineLength / 2;
        path.moveTo(this.align(centerX - dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX - dx), this.align(centerY + dy));
        path.moveTo(this.align(centerX + dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX + dx), this.align(centerY + dy));
    }
}
