"use strict";
var core_1 = require("@angular/core");
var BaseComponentFactory = (function () {
    function BaseComponentFactory() {
    }
    BaseComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented");
    };
    BaseComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented");
    };
    BaseComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented");
    };
    BaseComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw Error("Method not implemented");
    };
    return BaseComponentFactory;
}());
BaseComponentFactory.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
BaseComponentFactory.ctorParameters = function () { return []; };
exports.BaseComponentFactory = BaseComponentFactory;
//# sourceMappingURL=baseComponentFactory.js.map