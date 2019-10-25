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
import { Marker } from "./marker";
var Plus = /** @class */ (function (_super) {
    __extends(Plus, _super);
    function Plus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plus.prototype.updatePath = function () {
        var s = this.size / 1.3;
        var x = this.x - this.strokeWidth / 2;
        var y = this.y;
        this.path.setFromString("M" + (x - s / 2) + "," + (y - s / 2) + "l" + [0, -s, s, 0, 0, s, s, 0, 0, s, -s, 0, 0, s, -s, 0, 0, -s, -s, 0, 0, -s] + "z");
    };
    Plus.className = 'Plus';
    return Plus;
}(Marker));
export { Plus };
