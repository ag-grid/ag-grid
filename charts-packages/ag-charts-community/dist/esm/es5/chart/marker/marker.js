var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { Path, ScenePathChangeDetection } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
var Marker = /** @class */ (function (_super) {
    __extends(Marker, _super);
    function Marker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        _this.size = 12;
        return _this;
    }
    Marker.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var half = size / 2;
        return new BBox(x - half, y - half, size, size);
    };
    Marker.prototype.applyPath = function (s, moves) {
        var e_1, _a;
        var path = this.path;
        var _b = this, x = _b.x, y = _b.y;
        path.clear();
        try {
            for (var moves_1 = __values(moves), moves_1_1 = moves_1.next(); !moves_1_1.done; moves_1_1 = moves_1.next()) {
                var _c = moves_1_1.value, mx = _c.x, my = _c.y, t = _c.t;
                x += mx * s;
                y += my * s;
                if (t === 'move') {
                    path.moveTo(x, y);
                }
                else {
                    path.lineTo(x, y);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (moves_1_1 && !moves_1_1.done && (_a = moves_1.return)) _a.call(moves_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        path.closePath();
    };
    __decorate([
        ScenePathChangeDetection()
    ], Marker.prototype, "x", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Marker.prototype, "y", void 0);
    __decorate([
        ScenePathChangeDetection({ convertor: Math.abs })
    ], Marker.prototype, "size", void 0);
    return Marker;
}(Path));
export { Marker };
