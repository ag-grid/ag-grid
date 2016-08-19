// ag-grid-ng2 v5.2.3
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
var AgComponentFactory = (function () {
    function AgComponentFactory(_viewContainerRef, _componentResolver) {
        this._viewContainerRef = _viewContainerRef;
        this._componentResolver = _componentResolver;
    }
    AgComponentFactory.prototype.createCellRendererFromComponent = function (componentType) {
        return createCellRendererFromComponent(componentType, this._viewContainerRef, this._componentResolver, function (instance, params) {
            if (instance.agInit) {
                instance.agInit(params);
            }
        });
    };
    AgComponentFactory.prototype.createCellRendererFromTemplate = function (template) {
        return createCellRendererFromTemplate(this._viewContainerRef, this._componentResolver, template);
    };
    AgComponentFactory = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.ComponentResolver])
    ], AgComponentFactory);
    return AgComponentFactory;
}());
exports.AgComponentFactory = AgComponentFactory;
function createComponent(componentType, viewContainerRef, componentResolver) {
    return new Promise(function (resolve) {
        componentResolver.resolveComponent(componentType).then(function (factory) {
            var injector = viewContainerRef.parentInjector;
            var componentRef = viewContainerRef.createComponent(factory, undefined, injector, []);
            resolve(componentRef);
        });
    });
}
function createCellRendererFromComponent(componentType, viewContainerRef, componentResolver, initializer) {
    var CellRenderer = (function () {
        function CellRenderer() {
        }
        CellRenderer.prototype.init = function (params) {
            this._params = params;
        };
        CellRenderer.prototype.getGui = function () {
            var _this = this;
            var div = document.createElement('div');
            createComponent(componentType, viewContainerRef, componentResolver).then(function (cr) {
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
        };
        return CellRenderer;
    }());
    return CellRenderer;
}
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
function createCellRendererFromTemplate(viewContainerRef, componentResolver, template) {
    var componentType = createDynamicComponentType('dynamic-component', template);
    return createCellRendererFromComponent(componentType, viewContainerRef, componentResolver, function (i, p) { return i.params = p; });
}
