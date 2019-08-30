import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { normalizeAngle360 } from "../../util/angle";
import { isEqual } from "../../util/number";
import { BBox } from "../bbox";

export class Sector extends Shape {

    static className = 'Sector';

    protected path = new Path2D();

    static create(centerX: number, centerY: number, innerRadius: number, outerRadius: number,
                  startAngle: number = 0, endAngle: number = Math.PI * 2): Sector {
        const sector = new Sector();

        sector.centerX = centerX;
        sector.centerY = centerY;
        sector.innerRadius = innerRadius;
        sector.outerRadius = outerRadius;
        sector.startAngle = startAngle;
        sector.endAngle = endAngle;

        return sector;
    }

    private _dirtyPath = true;
    set dirtyPath(value: boolean) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath(): boolean {
        return this._dirtyPath;
    }

    private _centerX: number = 0;
    set centerX(value: number) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX(): number {
        return this._centerX;
    }

    private _centerY: number = 0;
    set centerY(value: number) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY(): number {
        return this._centerY;
    }

    private _centerOffset: number = 0;
    set centerOffset(value: number) {
        if (this._centerOffset !== value) {
            this._centerOffset = Math.max(0, value);
            this.dirtyPath = true;
        }
    }
    get centerOffset(): number {
        return this._centerOffset;
    }

    private _innerRadius: number = 10;
    set innerRadius(value: number) {
        if (this._innerRadius !== value) {
            this._innerRadius = value;
            this.dirtyPath = true;
        }
    }
    get innerRadius(): number {
        return this._innerRadius;
    }

    private _outerRadius: number = 20;
    set outerRadius(value: number) {
        if (this._outerRadius !== value) {
            this._outerRadius = value;
            this.dirtyPath = true;
        }
    }
    get outerRadius(): number {
        return this._outerRadius;
    }

    private _startAngle: number = 0;
    set startAngle(value: number) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirtyPath = true;
        }
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Math.PI * 2;
    set endAngle(value: number) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirtyPath = true;
        }
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _angleOffset: number = 0;
    set angleOffset(value: number) {
        if (this._angleOffset !== value) {
            this._angleOffset = value;
            this.dirtyPath = true;
        }
    }
    get angleOffset(): number {
        return this._angleOffset;
    }

    readonly getBBox = (): BBox => {
        const radius = this.outerRadius;
        return new BBox(
            this.centerX - radius,
            this.centerY - radius,
            radius * 2,
            radius * 2
        );
    }

    isPointInPath(x: number, y: number): boolean {
        const point = this.transformPoint(x, y);
        return this.path.isPointInPath(point.x, point.y);
    }

    isPointInStroke(x: number, y: number): boolean {
        return false;
    }

    private get fullPie(): boolean {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }

    updatePath(): void {
        if (!this.dirtyPath) {
            return;
        }

        const path = this.path;

        const angleOffset = this.angleOffset;
        const startAngle = Math.min(this.startAngle, this.endAngle) + angleOffset;
        const endAngle = Math.max(this.startAngle, this.endAngle) + angleOffset;
        const midAngle = (startAngle + endAngle) * 0.5;
        const innerRadius = Math.min(this.innerRadius, this.outerRadius);
        const outerRadius = Math.max(this.innerRadius, this.outerRadius);
        const centerOffset = this.centerOffset;
        const fullPie = this.fullPie;
        const radiiGap = outerRadius - innerRadius;
        // const tipOffset = radiiGap / 3;
        // const showTip = radiiGap < outerRadius / 2;
        let centerX = this.centerX;
        let centerY = this.centerY;

        path.clear();

        if (centerOffset) {
            centerX += centerOffset * Math.cos(midAngle);
            centerY += centerOffset * Math.sin(midAngle);
        }

        if (!fullPie) {
            path.moveTo(
                centerX + innerRadius * Math.cos(startAngle),
                centerY + innerRadius * Math.sin(startAngle)
            );
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(startAngle) + tipOffset * Math.cos(startAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(startAngle) + tipOffset * Math.sin(startAngle + Math.PI / 2)
            //     );
            // }
            path.lineTo(
                centerX + outerRadius * Math.cos(startAngle),
                centerY + outerRadius * Math.sin(startAngle)
            );
        }

        path.cubicArc(centerX, centerY, outerRadius, outerRadius, 0, startAngle, endAngle, 0);
        // path[fullPie ? 'moveTo' : 'lineTo'](
        //     centerX + innerRadius * Math.cos(endAngle),
        //     centerY + innerRadius * Math.sin(endAngle)
        // );
        if (fullPie) {
            path.moveTo(
                centerX + innerRadius * Math.cos(endAngle),
                centerY + innerRadius * Math.sin(endAngle)
            );
        } else {
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(endAngle) + tipOffset * Math.cos(endAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(endAngle) + tipOffset * Math.sin(endAngle + Math.PI / 2)
            //     );
            // }
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(
                Math.abs(x) < 1e-8 ? 0 : x,
                centerY + innerRadius * Math.sin(endAngle)
            );
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();

        this.dirtyPath = false;
    }

    render(ctx: CanvasRenderingContext2D): void {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);

        this.updatePath();
        this.scene!.appendPath(this.path);

        this.fillStroke(ctx);

        this.dirty = false;
    }
}
