"use strict";
var core_1 = require('@angular/core');
var main_1 = require('ag-grid/main');
var AgNoopComponentFactory = (function () {
    function AgNoopComponentFactory() {
    }
    AgNoopComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.prototype.createCellRendererFromTemplate = function (template, viewContainerRef) {
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.prototype.createRendererFromTemplate = function (template, viewContainerRef, moduleImports) {
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        console.log("Use AgGridModule.forRoot() if you wish to use dynamic components");
        throw new main_1.MethodNotImplementedException();
    };
    AgNoopComponentFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    AgNoopComponentFactory.ctorParameters = [];
    return AgNoopComponentFactory;
}());
exports.AgNoopComponentFactory = AgNoopComponentFactory;
