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
import { Marker } from './marker';
var Plus = /** @class */ (function (_super) {
    __extends(Plus, _super);
    function Plus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plus.prototype.updatePath = function () {
        var s = this.size / 3;
        _super.prototype.applyPath.call(this, s, Plus.moves);
    };
    Plus.className = 'Plus';
    Plus.moves = [
        { x: -0.5, y: -0.5, t: 'move' },
        { x: 0, y: -1 },
        { x: +1, y: 0 },
        { x: 0, y: +1 },
        { x: +1, y: 0 },
        { x: 0, y: +1 },
        { x: -1, y: 0 },
        { x: 0, y: +1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 0, y: -1 },
    ];
    return Plus;
}(Marker));
export { Plus };
