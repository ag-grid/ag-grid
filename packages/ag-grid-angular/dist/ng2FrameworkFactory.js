"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2FrameworkFactory = /** @class */ (function () {
    function Ng2FrameworkFactory(_componentFactory, _ngZone) {
        this._componentFactory = _componentFactory;
        this._ngZone = _ngZone;
    }
    Ng2FrameworkFactory.prototype.setViewContainerRef = function (viewContainerRef) {
        this._viewContainerRef = viewContainerRef;
    };
    Ng2FrameworkFactory.prototype.setTimeout = function (action, timeout) {
        this._ngZone.runOutsideAngular(function () {
            setTimeout(function () {
                action();
            }, timeout);
        });
    };
    Ng2FrameworkFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    Ng2FrameworkFactory.ctorParameters = function () { return [
        { type: baseComponentFactory_1.BaseComponentFactory, },
        { type: core_1.NgZone, },
    ]; };
    return Ng2FrameworkFactory;
}());
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
//# sourceMappingURL=ng2FrameworkFactory.js.map