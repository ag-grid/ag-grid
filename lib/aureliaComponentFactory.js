// ag-grid-aurelia v6.2.0
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
var aurelia_framework_1 = require('aurelia-framework');
var main_1 = require('ag-grid/main');
var AureliaComponentFactory = (function () {
    //private _factoryCache:{[key: string]: ComponentFactory<any>} = {};
    function AureliaComponentFactory(_viewCompiler) {
        this._viewCompiler = _viewCompiler;
    }
    // public createRendererFromComponent(componentType:{ new(...args:any[]): AgRendererComponent; },
    //                                    viewContainerRef:Container,
    //                                    childDependencies:any[] = [],
    //                                    moduleImports:any[] = []):{new(): ICellRenderer} {
    //     return this.adaptComponentToRenderer(componentType,
    //         viewContainerRef,
    //         this._viewCompiler,
    //         (<any>componentType).name,
    //         moduleImports,
    //         childDependencies);
    // }
    AureliaComponentFactory.prototype.createRendererFromTemplate = function (container, viewFactory) {
        var AureliaCellRendererComponent = (function () {
            function AureliaCellRendererComponent() {
            }
            AureliaCellRendererComponent.prototype.init = function (params) {
                var bindingContext = { params: params };
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);
            };
            AureliaCellRendererComponent.prototype.getGui = function () {
                return this.view.fragment;
            };
            AureliaCellRendererComponent.prototype.destroy = function () {
                this.view.returnToCache();
            };
            return AureliaCellRendererComponent;
        }());
        return AureliaCellRendererComponent;
    };
    AureliaComponentFactory.prototype.createEditorFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        return this.adaptComponentToEditor(componentType, viewContainerRef, this._viewCompiler, componentType.name, moduleImports, childDependencies);
    };
    AureliaComponentFactory.prototype.createFilterFromComponent = function (componentType, viewContainerRef, childDependencies, moduleImports) {
        if (childDependencies === void 0) { childDependencies = []; }
        if (moduleImports === void 0) { moduleImports = []; }
        return this.adaptComponentToFilter(componentType, viewContainerRef, this._viewCompiler, componentType.name, moduleImports, childDependencies);
    };
    AureliaComponentFactory.prototype.adaptComponentToRenderer = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
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
    AureliaComponentFactory.prototype.adaptComponentToEditor = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
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
    AureliaComponentFactory.prototype.adaptComponentToFilter = function (componentType, viewContainerRef, compiler, name, moduleImports, childDependencies) {
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
    AureliaComponentFactory = __decorate([
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.transient(), 
        __metadata('design:paramtypes', [aurelia_framework_1.ViewCompiler])
    ], AureliaComponentFactory);
    return AureliaComponentFactory;
}());
exports.AureliaComponentFactory = AureliaComponentFactory;
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
