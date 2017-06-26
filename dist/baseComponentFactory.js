"use strict";
var core_1 = require("@angular/core");
var main_1 = require("ag-grid/main");
var BaseComponentFactory = (function () {
    function BaseComponentFactory() {
    }
    BaseComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    BaseComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef) {
        console.log("Use AgGridModule.withComponents() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
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