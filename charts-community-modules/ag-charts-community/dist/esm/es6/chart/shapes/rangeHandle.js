var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
import { LINE_CAP, NUMBER, COLOR_STRING, Validate } from '../../util/validation';
export class RangeHandle extends Path {
    constructor() {
        super(...arguments);
        this._fill = '#f2f2f2';
        this._stroke = '#999999';
        this._strokeWidth = 1;
        this._lineCap = 'square';
        this._centerX = 0;
        this._centerY = 0;
        // Use an even number for better looking results.
        this._width = 8;
        // Use an even number for better looking results.
        this._gripLineGap = 2;
        // Use an even number for better looking results.
        this._gripLineLength = 8;
        this._height = 16;
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
    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width() {
        return this._width;
    }
    set gripLineGap(value) {
        if (this._gripLineGap !== value) {
            this._gripLineGap = value;
            this.dirtyPath = true;
        }
    }
    get gripLineGap() {
        return this._gripLineGap;
    }
    set gripLineLength(value) {
        if (this._gripLineLength !== value) {
            this._gripLineLength = value;
            this.dirtyPath = true;
        }
    }
    get gripLineLength() {
        return this._gripLineLength;
    }
    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height() {
        return this._height;
    }
    computeBBox() {
        const { centerX, centerY, width, height } = this;
        const x = centerX - width / 2;
        const y = centerY - height / 2;
        return new BBox(x, y, width, height);
    }
    isPointInPath(x, y) {
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
RangeHandle.className = 'RangeHandle';
__decorate([
    Validate(COLOR_STRING)
], RangeHandle.prototype, "_fill", void 0);
__decorate([
    Validate(COLOR_STRING)
], RangeHandle.prototype, "_stroke", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_strokeWidth", void 0);
__decorate([
    Validate(LINE_CAP)
], RangeHandle.prototype, "_lineCap", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_width", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_gripLineGap", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_gripLineLength", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeHandle.prototype, "_height", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VIYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvc2hhcGVzL3JhbmdlSGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFeEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWpGLE1BQU0sT0FBTyxXQUFZLFNBQVEsSUFBSTtJQUFyQzs7UUFJYyxVQUFLLEdBQUcsU0FBUyxDQUFDO1FBR2xCLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFHcEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFHakIsYUFBUSxHQUFHLFFBQXdCLENBQUM7UUFFcEMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQVdyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBVy9CLGlEQUFpRDtRQUV2QyxXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBVzdCLGlEQUFpRDtRQUV2QyxpQkFBWSxHQUFXLENBQUMsQ0FBQztRQVduQyxpREFBaUQ7UUFFdkMsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFZNUIsWUFBTyxHQUFXLEVBQUUsQ0FBQztJQXNEbkMsQ0FBQztJQW5IRyxJQUFJLE9BQU8sQ0FBQyxLQUFhO1FBQ3JCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFHRCxJQUFJLE9BQU8sQ0FBQyxLQUFhO1FBQ3JCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFLRCxJQUFJLEtBQUssQ0FBQyxLQUFhO1FBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFLRCxJQUFJLFdBQVcsQ0FBQyxLQUFhO1FBQ3pCLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxLQUFLLEVBQUU7WUFDN0IsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFLRCxJQUFJLGNBQWMsQ0FBQyxLQUFhO1FBQzVCLElBQUksSUFBSSxDQUFDLGVBQWUsS0FBSyxLQUFLLEVBQUU7WUFDaEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQ2hDLENBQUM7SUFJRCxJQUFJLE1BQU0sQ0FBQyxLQUFhO1FBQ3BCLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxLQUFLLEVBQUU7WUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBQ0QsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXO1FBQ1AsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqRCxNQUFNLENBQUMsR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsR0FBRyxPQUFPLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUUvQixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxhQUFhLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWhDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsVUFBVTtRQUNOLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXZELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUViLE1BQU0sQ0FBQyxHQUFHLE9BQU8sR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixNQUFNLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZDLFVBQVU7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVwQixjQUFjO1FBQ2QsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7O0FBaklNLHFCQUFTLEdBQUcsYUFBYSxDQUFDO0FBR2pDO0lBREMsUUFBUSxDQUFDLFlBQVksQ0FBQzswQ0FDSztBQUc1QjtJQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7NENBQ087QUFHOUI7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lEQUNPO0FBRzNCO0lBREMsUUFBUSxDQUFDLFFBQVEsQ0FBQzs2Q0FDMkI7QUEwQjlDO0lBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzsyQ0FDUztBQWE3QjtJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aURBQ2U7QUFhbkM7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29EQUNrQjtBQVl0QztJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7NENBQ1cifQ==