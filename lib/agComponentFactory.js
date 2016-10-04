"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('@angular/core');
var compiler_1 = require("@angular/compiler");
var main_1 = require('ag-grid/main');
var AgComponentFactory = (function () {
    function AgComponentFactory(_runtimeCompiler) {
        this._runtimeCompiler = _runtimeCompiler;
        this._factoryCache = {};
    }
    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.component
     */
    AgComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        console.log("createCellRendererFromComponent Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.component");
        return this.createRendererFromComponent(componentType, viewContainerRef, childDependencies, moduleImports);
    };
    /**
     * Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.template
     */
    AgComponentFactory.prototype.createCellRendererFromTemplate = function (template, viewContainerRef) {
        console.log("createCellRendererFromTemplate Deprecated - please declare ng2 components in ColDefs via colDef.cellRendererFramework.template");
        return this.createRendererFromTemplate(template, viewContainerRef);
    };
    AgComponentFactory.prototype.createRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        return this.adaptComponentToRenderer(componentType, viewContainerRef, this._runtimeCompiler, componentType.name, moduleImports, childDependencies);
    };
    AgComponentFactory.prototype.createRendererFromTemplate = function (template, viewContainerRef, moduleImports) {
        if (moduleImports === void 0) { moduleImports = []; }
        var componentType = this.createDynamicComponentType('dynamic-component', template);
        return this.adaptComponentToRenderer(componentType, viewContainerRef, this._runtimeCompiler, template, moduleImports, []);
    };
    AgComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        return this.adaptComponentToEditor(componentType, viewContainerRef, this._runtimeCompiler, componentType.name, moduleImports, childDependencies);
    };
    AgComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        return this.adaptComponentToFilter(componentType, viewContainerRef, this._runtimeCompiler, componentType.name, moduleImports, childDependencies);
    };
    AgComponentFactory.prototype.adaptComponentToRenderer = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
        var that = this;
        var CellRenderer = (function (_super) {
            __extends(CellRenderer, _super);
            function CellRenderer() {
                _super.apply(this, arguments);
            }
            CellRenderer.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            CellRenderer.prototype.refresh = function (params) {
                this._params = params;
                if (this._agAwareComponent.refresh) {
                    this._agAwareComponent.refresh(params);
                }
                else {
                    throw new main_1.MethodNotImplementedException();
                }
            };
            CellRenderer.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
            };
            return CellRenderer;
        }(BaseGuiComponent));
        return CellRenderer;
    };
    AgComponentFactory.prototype.adaptComponentToEditor = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
        var that = this;
        var CellEditor = (function (_super) {
            __extends(CellEditor, _super);
            function CellEditor() {
                _super.apply(this, arguments);
            }
            CellEditor.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
            };
            CellEditor.prototype.getValue = function () {
                return this._agAwareComponent.getValue();
            };
            CellEditor.prototype.isPopup = function () {
                return this._agAwareComponent.isPopup ?
                    this._agAwareComponent.isPopup() : false;
            };
            CellEditor.prototype.isCancelBeforeStart = function () {
                return this._agAwareComponent.isCancelBeforeStart ?
                    this._agAwareComponent.isCancelBeforeStart() : false;
            };
            CellEditor.prototype.isCancelAfterEnd = function () {
                return this._agAwareComponent.isCancelAfterEnd ?
                    this._agAwareComponent.isCancelAfterEnd() : false;
            };
            CellEditor.prototype.focusIn = function () {
                if (this._agAwareComponent.focusIn) {
                    this._agAwareComponent.focusIn();
                }
            };
            CellEditor.prototype.focusOut = function () {
                if (this._agAwareComponent.focusOut) {
                    this._agAwareComponent.focusOut();
                }
            };
            CellEditor.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
            };
            return CellEditor;
        }(BaseGuiComponent));
        return CellEditor;
    };
    AgComponentFactory.prototype.adaptComponentToFilter = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
        var that = this;
        var Filter = (function (_super) {
            __extends(Filter, _super);
            function Filter() {
                _super.apply(this, arguments);
            }
            Filter.prototype.init = function (params) {
                _super.prototype.init.call(this, params);
                this._componentRef.changeDetectorRef.detectChanges();
            };
            Filter.prototype.isFilterActive = function () {
                return this._agAwareComponent.isFilterActive();
            };
            Filter.prototype.doesFilterPass = function (params) {
                return this._agAwareComponent.doesFilterPass(params);
            };
            Filter.prototype.getModel = function () {
                return this._agAwareComponent.getModel();
            };
            Filter.prototype.setModel = function (model) {
                this._agAwareComponent.setModel(model);
            };
            Filter.prototype.afterGuiAttached = function (params) {
                if (this._agAwareComponent.afterGuiAttached) {
                    this._agAwareComponent.afterGuiAttached(params);
                }
            };
            Filter.prototype.getFrameworkComponentInstance = function () {
                return this._frameworkComponentInstance;
            };
            Filter.prototype.createComponent = function () {
                return that.createComponent(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies);
            };
            return Filter;
        }(BaseGuiComponent));
        return Filter;
    };
    AgComponentFactory.prototype.createComponent = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
        var factory = this._factoryCache[name];
        if (!factory) {
            var module = this.createComponentModule(componentType, moduleImports, childDependencies);
            var moduleWithFactories = compiler.compileModuleAndAllComponentsSync(module);
            factory = moduleWithFactories.componentFactories.find(function (factory) { return factory.componentType === componentType; });
            this._factoryCache[name] = factory;
        }
        return viewContainerRef.createComponent(factory);
    };
    AgComponentFactory.prototype.createComponentModule = function (componentType, moduleImports, childDependencies) {
        var RuntimeComponentModule = (function () {
            function RuntimeComponentModule() {
            }
            RuntimeComponentModule.decorators = [
                { type: core_1.NgModule, args: [{
                            imports: moduleImports,
                            declarations: [componentType].concat(childDependencies),
                            exports: []
                        },] },
            ];
            /** @nocollapse */
            RuntimeComponentModule.ctorParameters = [];
            return RuntimeComponentModule;
        }());
        // a module for just this Type
        return RuntimeComponentModule;
    };
    AgComponentFactory.prototype.createDynamicComponentType = function (selector, template) {
        var DynamicComponent = (function () {
            function DynamicComponent() {
            }
            DynamicComponent.prototype.agInit = function (params) {
                this.params = params;
            };
            // not applicable for template components
            DynamicComponent.prototype.getFrameworkComponentInstance = function () {
                return undefined;
            };
            // not applicable for template components
            DynamicComponent.prototype.refresh = function (params) {
            };
            DynamicComponent.decorators = [
                { type: core_1.Component, args: [{ selector: selector, template: template },] },
            ];
            /** @nocollapse */
            DynamicComponent.ctorParameters = [];
            return DynamicComponent;
        }());
        return DynamicComponent;
    };
    AgComponentFactory.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    AgComponentFactory.ctorParameters = [
        { type: compiler_1.RuntimeCompiler, },
    ];
    return AgComponentFactory;
}());
exports.AgComponentFactory = AgComponentFactory;
var BaseGuiComponent = (function () {
    function BaseGuiComponent() {
    }
    BaseGuiComponent.prototype.init = function (params) {
        this._params = params;
        this._componentRef = this.createComponent();
        this._agAwareComponent = this._componentRef.instance;
        this._frameworkComponentInstance = this._componentRef.instance;
        this._eGui = this._componentRef.location.nativeElement;
        this._agAwareComponent.agInit(this._params);
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._eGui;
    };
    BaseGuiComponent.prototype.destroy = function () {
        if (this._componentRef) {
            this._componentRef.destroy();
        }
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        return this._frameworkComponentInstance;
    };
    return BaseGuiComponent;
}());
