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
var Cross = /** @class */ (function (_super) {
    __extends(Cross, _super);
    function Cross() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cross.prototype.updatePath = function () {
        var s = this.size / 4.2;
        _super.prototype.applyPath.call(this, s, Cross.moves);
    };
    Cross.className = 'Cross';
    Cross.moves = [
        { x: -1, y: 0, t: 'move' },
        { x: -1, y: -1 },
        { x: +1, y: -1 },
        { x: +1, y: +1 },
        { x: +1, y: -1 },
        { x: +1, y: +1 },
        { x: -1, y: +1 },
        { x: +1, y: +1 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
        { x: -1, y: +1 },
        { x: -1, y: -1 },
    ];
    return Cross;
}(Marker));
export { Cross };
