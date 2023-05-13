var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Marker } from './marker';
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Triangle.prototype.updatePath = function () {
        var s = this.size * 1.1;
        _super.prototype.applyPath.call(this, s, Triangle.moves);
    };
    Triangle.className = 'Triangle';
    Triangle.moves = [
        { x: 0, y: -0.48, t: 'move' },
        { x: 0.5, y: 0.87 },
        { x: -1, y: 0 },
    ];
    return Triangle;
}(Marker));
export { Triangle };
