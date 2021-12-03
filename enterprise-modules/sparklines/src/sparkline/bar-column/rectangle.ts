import { Shape } from '../../scene/shape/shape';

export class Rectangle extends Shape {
    static className = 'Column';

    private _x: number = 0;
    set x(value: number) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y(): number {
        return this._y;
    }

    private _width: number = 0;
    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.dirty = true;
        }
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 0;
    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.dirty = true;
        }
    }
    get height(): number {
        return this._height;
    }

    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     */
    private _crisp: boolean = false;
    set crisp(value: boolean) {
        if (this._crisp !== value) {
            this._crisp = value;
            this.dirty = true;
        }
    }
    get crisp(): boolean {
        return this._crisp;
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    isPointInPath(x: number, y: number): boolean {
        return false;
    }

    render(ctx: CanvasRenderingContext2D) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        const { x, y, width, height, crisp } = this;
        ctx.beginPath();

        if (crisp) {
            // ensure stroke aligns to the pixel grid
            const { alignment: a, align: al } = this;
            ctx.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        } else {
            ctx.rect(x, y, width, height);
        }

        this.fillStroke(ctx);

        this.dirty = false;
    }
}