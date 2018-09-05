"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BaseComponentFactory = /** @class */ (function () {
    function BaseComponentFactory() {
    }
    BaseComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented");
    };
    BaseComponentFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    BaseComponentFactory.ctorParameters = function () { return []; };
    return BaseComponentFactory;
}());
exports.BaseComponentFactory = BaseComponentFactory;
//# sourceMappingURL=baseComponentFactory.js.map