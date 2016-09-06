// ag-grid-ng2 v5.3.2
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var core_2 = require('@angular/core');
var compiler_1 = require("@angular/compiler");
var AgComponentFactory = (function () {
    function AgComponentFactory(compiler) {
        this.compiler = compiler;
        this._cacheOfModules = {};
    }
    AgComponentFactory.prototype.createCellRendererFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        var componentAsFunction = componentType;
        return this.adaptComponent(componentType, viewContainerRef, this.compiler, componentAsFunction.name, function (instance, params) {
            if (instance.agInit) {
                instance.agInit(params);
            }
        }, moduleImports ? moduleImports : [], childDependencies);
    };
    AgComponentFactory.prototype.createCellRendererFromTemplate = function (template, viewContainerRef) {
        return this.adaptTemplate(viewContainerRef, this.compiler, template);
    };
    AgComponentFactory.prototype.adaptComponent = function (componentType, viewContainerRef, compiler, name, initializer, moduleImports, childDependencies) {
        var that = this;
        var CellRenderer = (function () {
            function CellRenderer() {
            }
            CellRenderer.prototype.init = function (params) {
                this._params = params;
            };
            CellRenderer.prototype.getGui = function () {
                var _this = this;
                var div = document.createElement('div');
                that.createComponent(componentType, viewContainerRef, compiler, name, moduleImports, childDependencies).then(function (cr) {
                    _this._componentRef = cr;
                    if (initializer) {
                        initializer(cr.instance, _this._params);
                    }
                    div.appendChild(cr.location.nativeElement);
                });
                return div;
            };
            CellRenderer.prototype.destroy = function () {
                if (this._componentRef) {
                    this._componentRef.destroy();
                }
            };
            CellRenderer.prototype.refresh = function (params) {
                this._params = params;
                this._componentRef.changeDetectorRef.detectChanges();
            };
            return CellRenderer;
        }());
        return CellRenderer;
    };
    AgComponentFactory.prototype.createComponent = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
        var _this = this;
        return new Promise(function (resolve) {
            var module = _this._cacheOfModules[name];
            if (!module) {
                module = _this.createComponentModule(componentType, moduleImports, childDependencies);
                _this._cacheOfModules[name] = module;
            }
            compiler
                .compileModuleAndAllComponentsAsync(module)
                .then(function (moduleWithFactories) {
                var factory = null;
                for (var i = 0; i < moduleWithFactories.componentFactories.length && factory === null; i++) {
                    if (moduleWithFactories.componentFactories[i].componentType === componentType) {
                        factory = moduleWithFactories.componentFactories[i];
                    }
                }
                var componentRef = viewContainerRef.createComponent(factory);
                resolve(componentRef);
            });
        });
    };
    AgComponentFactory.prototype.createComponentModule = function (componentType, moduleImports, childDependencies) {
        var moduleDeclarations = [componentType];
        if (childDependencies) {
            moduleDeclarations.push(childDependencies);
        }
        var RuntimeComponentModule = (function () {
            function RuntimeComponentModule() {
            }
            RuntimeComponentModule = __decorate([
                core_2.NgModule({
                    imports: moduleImports,
                    declarations: moduleDeclarations,
                    exports: []
                }), 
                __metadata('design:paramtypes', [])
            ], RuntimeComponentModule);
            return RuntimeComponentModule;
        }());
        // a module for just this Type
        return RuntimeComponentModule;
    };
    AgComponentFactory.prototype.adaptTemplate = function (viewContainerRef, compiler, template) {
        var componentType = createDynamicComponentType('dynamic-component', template);
        return this.adaptComponent(componentType, viewContainerRef, compiler, template, function (i, p) { return i.params = p; }, []);
    };
    AgComponentFactory = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [compiler_1.RuntimeCompiler])
    ], AgComponentFactory);
    return AgComponentFactory;
}());
exports.AgComponentFactory = AgComponentFactory;
/**
 From Template
 */
var DynamicComponent = (function () {
    function DynamicComponent() {
        this.params = null;
    }
    return DynamicComponent;
}());
function createDynamicComponentType(selector, template) {
    var Fake = (function (_super) {
        __extends(Fake, _super);
        function Fake() {
            _super.apply(this, arguments);
        }
        Fake = __decorate([
            core_1.Component({ selector: selector, template: template }), 
            __metadata('design:paramtypes', [])
        ], Fake);
        return Fake;
    }(DynamicComponent));
    return Fake;
}
