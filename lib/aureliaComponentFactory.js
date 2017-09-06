// ag-grid-aurelia v13.0.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var aurelia_framework_1 = require("aurelia-framework");
var AureliaComponentFactory = (function () {
    function AureliaComponentFactory(taskQueue) {
        this.taskQueue = taskQueue;
    }
    AureliaComponentFactory.prototype.createRendererFromTemplate = function (container, viewFactory) {
        var componentFactory = this;
        var CellRendererComponent = (function () {
            function CellRendererComponent() {
            }
            CellRendererComponent.prototype.init = function (params) {
                var _this = this;
                var bindingContext = { params: params };
                this.view = viewFactory.create(container);
                var controllers = this.view.controllers;
                //initialize each controller
                if (controllers && controllers.length) {
                    controllers.forEach(function (c) {
                        c.viewModel.params = params;
                    });
                    this.view.bind(bindingContext);
                    //ICellRenderer doesn't have a guiAttached method so
                    //we call attach on the queue;
                    componentFactory.taskQueue.queueMicroTask(function () { return _this.view.attached(); });
                }
                else {
                    this.view.bind(bindingContext);
                }
            };
            CellRendererComponent.prototype.getGui = function () {
                return this.view.fragment;
            };
            CellRendererComponent.prototype.destroy = function () {
                this.view.returnToCache();
            };
            CellRendererComponent.prototype.refresh = function (params) {
                return false;
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
                this.view.bind(bindingContext);
            };
            CellEditor.prototype.afterGuiAttached = function () {
                if (this.editorVm.afterGuiAttached) {
                    this.editorVm.afterGuiAttached();
                }
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
        __metadata("design:paramtypes", [aurelia_framework_1.TaskQueue])
    ], AureliaComponentFactory);
    return AureliaComponentFactory;
}());
exports.AureliaComponentFactory = AureliaComponentFactory;
