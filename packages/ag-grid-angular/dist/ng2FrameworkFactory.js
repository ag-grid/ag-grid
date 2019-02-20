"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Ng2FrameworkFactory = /** @class */ (function () {
    function Ng2FrameworkFactory(_ngZone) {
        this._ngZone = _ngZone;
    }
    Ng2FrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._ngZone.runOutsideAngular(function () {
            window.setTimeout(function () {
                action();
            }, timeout);
        });
    };
    Ng2FrameworkFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    Ng2FrameworkFactory.ctorParameters = function () { return [
        { type: core_1.NgZone, },
    ]; };
    return Ng2FrameworkFactory;
}());
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
//# sourceMappingURL=ng2FrameworkFactory.js.map