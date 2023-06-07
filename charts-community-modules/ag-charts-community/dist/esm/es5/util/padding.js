var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NUMBER, Validate } from './validation';
var Padding = /** @class */ (function () {
    function Padding(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = top; }
        if (bottom === void 0) { bottom = top; }
        if (left === void 0) { left = right; }
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    Padding.prototype.clear = function () {
        this.top = this.right = this.bottom = this.left = 0;
    };
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "top", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "right", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "bottom", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Padding.prototype, "left", void 0);
    return Padding;
}());
export { Padding };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL3BhZGRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFaEQ7SUFhSSxpQkFBWSxHQUFlLEVBQUUsS0FBbUIsRUFBRSxNQUFvQixFQUFFLElBQW9CO1FBQWhGLG9CQUFBLEVBQUEsT0FBZTtRQUFFLHNCQUFBLEVBQUEsV0FBbUI7UUFBRSx1QkFBQSxFQUFBLFlBQW9CO1FBQUUscUJBQUEsRUFBQSxZQUFvQjtRQUN4RixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRCx1QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQXBCRDtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7d0NBQ1I7SUFHWjtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7MENBQ047SUFHZDtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7MkNBQ0w7SUFHZjtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7eUNBQ1A7SUFZakIsY0FBQztDQUFBLEFBdkJELElBdUJDO1NBdkJZLE9BQU8ifQ==