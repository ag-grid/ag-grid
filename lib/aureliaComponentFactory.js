// ag-grid-aurelia v7.0.0
"use strict";
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
        var CellRendererComponent = (function () {
            function CellRendererComponent() {
            }
            CellRendererComponent.prototype.init = function (params) {
                var bindingContext = { params: params };
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);
            };
            CellRendererComponent.prototype.getGui = function () {
                return this.view.fragment;
            };
            CellRendererComponent.prototype.destroy = function () {
                this.view.returnToCache();
            };
            return CellRendererComponent;
        }());
        return CellRendererComponent;
    };
    AureliaComponentFactory.prototype.createEditorFromTemplate = function (container, viewFactory) {
        var CellEditor = (function () {
            function CellEditor() {
            }
            CellEditor.prototype.init = function (params) {
                var bindingContext = { params: params };
                this.view = viewFactory.create(container);
                this.view.bind(bindingContext);
                var controllers = this.view.controllers;
                //only one controller is allowed in editor template
                if (controllers &&
                    controllers.length == 1 &&
                    controllers[0].viewModel) {
                    this.editorVm = controllers[0].viewModel;
                    //this is a 'hack' because we don't have params.bind="" in the template
                    //must reset params or it will be nothing
                    this.editorVm.params = params;
                }
                else {
                    console.error('The editor template component is missing an IEditorViewModel or it contains more than one component');
                }
            };
            CellEditor.prototype.afterGuiAttached = function () {
                this.view.attached();
            };
            CellEditor.prototype.getGui = function () {
                return this.view.fragment;
            };
            CellEditor.prototype.destroy = function () {
                if (this.editorVm.destroy) {
                    this.editorVm.destroy();
                }
                this.view.returnToCache();
            };
            CellEditor.prototype.getValue = function () {
                return this.editorVm.getValue();
            };
            CellEditor.prototype.isPopup = function () {
                return this.editorVm.isPopup ?
                    this.editorVm.isPopup() : false;
            };
            CellEditor.prototype.isCancelBeforeStart = function () {
                return this.editorVm.isCancelBeforeStart ?
                    this.editorVm.isCancelBeforeStart() : false;
            };
            CellEditor.prototype.isCancelAfterEnd = function () {
                return this.editorVm.isCancelAfterEnd ?
                    this.editorVm.isCancelAfterEnd() : false;
            };
            CellEditor.prototype.focusIn = function () {
                if (this.editorVm.focusIn) {
                    this.editorVm.focusIn();
                }
            };
            CellEditor.prototype.focusOut = function () {
                if (this.editorVm.focusOut) {
                    this.editorVm.focusOut();
                }
            };
            return CellEditor;
        }());
        return CellEditor;
    };
    AureliaComponentFactory = __decorate([
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.transient(), 
        __metadata('design:paramtypes', [aurelia_framework_1.ViewCompiler])
    ], AureliaComponentFactory);
    return AureliaComponentFactory;
}());
exports.AureliaComponentFactory = AureliaComponentFactory;
// abstract class BaseGuiComponent<P, T extends AgFrameworkComponent<P>> {
//     protected _params:P;
//     protected _eGui:HTMLElement;
//     protected _componentRef:ComponentRef<T>;
//     protected _agAwareComponent:T;
//     protected _frameworkComponentInstance:any;  // the users component - for accessing methods they create
//
//     protected init(params:P):void {
//         this._params = params;
//
//         this._componentRef = this.createComponent();
//         this._agAwareComponent = this._componentRef.instance;
//         this._frameworkComponentInstance = this._componentRef.instance;
//         this._eGui = this._componentRef.location.nativeElement;
//
//         this._agAwareComponent.agInit(this._params);
//     }
//
//     public getGui():HTMLElement {
//         return this._eGui;
//     }
//
//     public destroy():void {
//         if (this._componentRef) {
//             this._componentRef.destroy();
//         }
//     }
//
//     public getFrameworkComponentInstance():any {
//         return this._frameworkComponentInstance;
//     }
//
//     protected abstract createComponent():ComponentRef<T>;
// }
