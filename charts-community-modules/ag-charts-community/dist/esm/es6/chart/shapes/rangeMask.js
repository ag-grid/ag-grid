var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
import { LINE_CAP, NUMBER, COLOR_STRING, Validate } from '../../util/validation';
export class RangeMask extends Path {
    constructor() {
        super(...arguments);
        this._stroke = '#999999';
        this._strokeWidth = 1;
        this._fill = '#999999';
        this._fillOpacity = 0.2;
        this._lineCap = 'square';
        this._x = 0;
        this._y = 0;
        this._width = 200;
        this._height = 30;
        this.minRange = 0.05;
        this._min = 0;
        this._max = 1;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y() {
        return this._y;
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
    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height() {
        return this._height;
    }
    set min(value) {
        var _a;
        value = Math.min(Math.max(value, 0), this.max - this.minRange);
        if (isNaN(value)) {
            return;
        }
        if (this._min !== value) {
            this._min = value;
            this.dirtyPath = true;
            (_a = this.onRangeChange) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    }
    get min() {
        return this._min;
    }
    set max(value) {
        var _a;
        value = Math.max(Math.min(value, 1), this.min + this.minRange);
        if (isNaN(value)) {
            return;
        }
        if (this._max !== value) {
            this._max = value;
            this.dirtyPath = true;
            (_a = this.onRangeChange) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    }
    get max() {
        return this._max;
    }
    computeBBox() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    computeVisibleRangeBBox() {
        const { x, y, width, height, min, max } = this;
        const minX = x + width * min;
        const maxX = x + width * max;
        return new BBox(minX, y, maxX - minX, height);
    }
    updatePath() {
        const { path, x, y, width, height, min, max } = this;
        path.clear();
        const ax = this.align(x);
        const ay = this.align(y);
        const axw = ax + this.align(x, width);
        const ayh = ay + this.align(y, height);
        // Whole range.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        const minX = this.align(x + width * min);
        const maxX = this.align(x + width * max);
        // Visible range.
        path.moveTo(minX, ay);
        path.lineTo(minX, ayh);
        path.lineTo(maxX, ayh);
        path.lineTo(maxX, ay);
        path.lineTo(minX, ay);
    }
}
RangeMask.className = 'RangeMask';
__decorate([
    Validate(COLOR_STRING)
], RangeMask.prototype, "_stroke", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeMask.prototype, "_strokeWidth", void 0);
__decorate([
    Validate(COLOR_STRING)
], RangeMask.prototype, "_fill", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], RangeMask.prototype, "_fillOpacity", void 0);
__decorate([
    Validate(LINE_CAP)
], RangeMask.prototype, "_lineCap", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeMask.prototype, "_width", void 0);
__decorate([
    Validate(NUMBER(0))
], RangeMask.prototype, "_height", void 0);
__decorate([
    Validate(NUMBER())
], RangeMask.prototype, "_min", void 0);
__decorate([
    Validate(NUMBER())
], RangeMask.prototype, "_max", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VNYXNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3NoYXBlcy9yYW5nZU1hc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUV4QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFakYsTUFBTSxPQUFPLFNBQVUsU0FBUSxJQUFJO0lBQW5DOztRQUljLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFHcEIsaUJBQVksR0FBRyxDQUFDLENBQUM7UUFHakIsVUFBSyxHQUFHLFNBQVMsQ0FBQztRQUdsQixpQkFBWSxHQUFHLEdBQUcsQ0FBQztRQUduQixhQUFRLEdBQWlCLFFBQVEsQ0FBQztRQUVsQyxPQUFFLEdBQVcsQ0FBQyxDQUFDO1FBV2YsT0FBRSxHQUFXLENBQUMsQ0FBQztRQVlmLFdBQU0sR0FBVyxHQUFHLENBQUM7UUFZckIsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQVcvQixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBR04sU0FBSSxHQUFXLENBQUMsQ0FBQztRQWlCakIsU0FBSSxHQUFXLENBQUMsQ0FBQztJQXdEL0IsQ0FBQztJQXpIRyxJQUFJLENBQUMsQ0FBQyxLQUFhO1FBQ2YsSUFBSSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssRUFBRTtZQUNuQixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztZQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFDRCxJQUFJLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdELElBQUksQ0FBQyxDQUFDLEtBQWE7UUFDZixJ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SSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQzdCLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxVQUFVO1FBQ04sTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsTUFBTSxHQUFHLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2QyxlQUFlO1FBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFcEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztRQUN6QyxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQzs7QUExSU0sbUJBQVMsR0FBRyxXQUFXLENBQUM7QUFHL0I7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDOzBDQUNPO0FBRzlCO0lBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzsrQ0FDTztBQUczQjtJQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7d0NBQ0s7QUFHNUI7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzsrQ0FDTTtBQUc3QjtJQURDLFFBQVEsQ0FBQyxRQUFRLENBQUM7MkNBQ3lCO0FBeUI1QztJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7eUNBQ1c7QUFZL0I7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOzBDQUNXO0FBYy9CO0lBREMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO3VDQUNRO0FBaUIzQjtJQURDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt1Q0FDUSJ9