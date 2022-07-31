import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { normalizeAngle360 } from "../../util/angle";
import { isEqual } from "../../util/number";
import { BBox } from "../bbox";
export class Sector extends Shape {
    constructor() {
        super(...arguments);
        this.path = new Path2D();
        this._dirtyPath = true;
        this._centerX = 0;
        this._centerY = 0;
        this._centerOffset = 0;
        this._innerRadius = 10;
        this._outerRadius = 20;
        this._startAngle = 0;
        this._endAngle = Math.PI * 2;
        this._angleOffset = 0;
    }
    set dirtyPath(value) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath() {
        return this._dirtyPath;
    }
    set centerX(value) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX() {
        return this._centerX;
    }
    set centerY(value) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY() {
        return this._centerY;
    }
    set centerOffset(value) {
        if (this._centerOffset !== value) {
            this._centerOffset = Math.max(0, value);
            this.dirtyPath = true;
        }
    }
    get centerOffset() {
        return this._centerOffset;
    }
    set innerRadius(value) {
        if (this._innerRadius !== value) {
            this._innerRadius = value;
            this.dirtyPath = true;
        }
    }
    get innerRadius() {
        return this._innerRadius;
    }
    set outerRadius(value) {
        if (this._outerRadius !== value) {
            this._outerRadius = value;
            this.dirtyPath = true;
        }
    }
    get outerRadius() {
        return this._outerRadius;
    }
    set startAngle(value) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirtyPath = true;
        }
    }
    get startAngle() {
        return this._startAngle;
    }
    set endAngle(value) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirtyPath = true;
        }
    }
    get endAngle() {
        return this._endAngle;
    }
    set angleOffset(value) {
        if (this._angleOffset !== value) {
            this._angleOffset = value;
            this.dirtyPath = true;
        }
    }
    get angleOffset() {
        return this._angleOffset;
    }
    computeBBox() {
        const radius = this.outerRadius;
        return new BBox(this.centerX - radius, this.centerY - radius, radius * 2, radius * 2);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        return this.path.isPointInPath(point.x, point.y);
    }
    isPointInStroke(x, y) {
        return false;
    }
    get fullPie() {
        return isEqual(normalizeAngle360(this.startAngle), normalizeAngle360(this.endAngle));
    }
    updatePath() {
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
        let centerX = this.centerX;
        let centerY = this.centerY;
        path.clear();
        if (centerOffset) {
            centerX += centerOffset * Math.cos(midAngle);
            centerY += centerOffset * Math.sin(midAngle);
        }
        if (!fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(startAngle) + tipOffset * Math.cos(startAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(startAngle) + tipOffset * Math.sin(startAngle + Math.PI / 2)
            //     );
            // }
            path.lineTo(centerX + outerRadius * Math.cos(startAngle), centerY + outerRadius * Math.sin(startAngle));
        }
        path.cubicArc(centerX, centerY, outerRadius, outerRadius, 0, startAngle, endAngle, 0);
        // path[fullPie ? 'moveTo' : 'lineTo'](
        //     centerX + innerRadius * Math.cos(endAngle),
        //     centerY + innerRadius * Math.sin(endAngle)
        // );
        if (fullPie) {
            path.moveTo(centerX + innerRadius * Math.cos(endAngle), centerY + innerRadius * Math.sin(endAngle));
        }
        else {
            // if (showTip) {
            //     path.lineTo(
            //         centerX + 0.5 * (innerRadius + outerRadius) * Math.cos(endAngle) + tipOffset * Math.cos(endAngle + Math.PI / 2),
            //         centerY + 0.5 * (innerRadius + outerRadius) * Math.sin(endAngle) + tipOffset * Math.sin(endAngle + Math.PI / 2)
            //     );
            // }
            // Temp workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=993330
            // Revert this commit when fixed ^^.
            const x = centerX + innerRadius * Math.cos(endAngle);
            path.lineTo(Math.abs(x) < 1e-8 ? 0 : x, centerY + innerRadius * Math.sin(endAngle));
        }
        path.cubicArc(centerX, centerY, innerRadius, innerRadius, 0, endAngle, startAngle, 1);
        path.closePath();
        this.dirtyPath = false;
    }
    render(ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    }
}
Sector.className = 'Sector';
