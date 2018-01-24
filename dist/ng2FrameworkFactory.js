"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var baseComponentFactory_1 = require("./baseComponentFactory");
var Ng2FrameworkFactory = (function () {
    function Ng2FrameworkFactory(_componentFactory, _ngZone) {
        this._componentFactory = _componentFactory;
        this._ngZone = _ngZone;
        this._baseFrameworkFactory = new main_1.BaseFrameworkFactory(); // todo - inject this
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
    return Ng2FrameworkFactory;
}());
Ng2FrameworkFactory.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
Ng2FrameworkFactory.ctorParameters = function () { return [
    { type: baseComponentFactory_1.BaseComponentFactory, },
    { type: core_1.NgZone, },
]; };
exports.Ng2FrameworkFactory = Ng2FrameworkFactory;
//# sourceMappingURL=ng2FrameworkFactory.js.map