// ag-grid-aurelia v19.1.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var ag_grid_community_1 = require("ag-grid-community");
var AureliaFrameworkComponentWrapper = /** @class */ (function (_super) {
    __extends(AureliaFrameworkComponentWrapper, _super);
    function AureliaFrameworkComponentWrapper(taskQueue, _viewCompiler) {
        var _this = _super.call(this) || this;
        _this.taskQueue = taskQueue;
        _this._viewCompiler = _viewCompiler;
        return _this;
    }
    AureliaFrameworkComponentWrapper.prototype.createWrapper = function (template) {
        var that = this;
        var DynamicComponent = /** @class */ (function (_super) {
            __extends(DynamicComponent, _super);
            function DynamicComponent() {
                return _super.call(this, that.taskQueue, that._viewCompiler) || this;
            }
            DynamicComponent.prototype.init = function (params) {
                _super.prototype.init.call(this, params, template.template, that._viewResources, that._container);
            };
            DynamicComponent.prototype.hasMethod = function (name) {
                return wrapper.getFrameworkComponentInstance() && wrapper.getFrameworkComponentInstance()[name] != null;
            };
            DynamicComponent.prototype.callMethod = function (name, args) {
                var componentRef = this.getFrameworkComponentInstance();
                return wrapper.getFrameworkComponentInstance()[name].apply(componentRef, args);
            };
            DynamicComponent.prototype.addMethod = function (name, callback) {
                wrapper[name] = callback;
            };
            return DynamicComponent;
        }(BaseGuiComponent));
        var wrapper = new DynamicComponent();
        return wrapper;
    };
    AureliaFrameworkComponentWrapper.prototype.setContainer = function (container) {
        this._container = container;
    };
    AureliaFrameworkComponentWrapper.prototype.setViewResources = function (viewResources) {
        this._viewResources = viewResources;
    };
    AureliaFrameworkComponentWrapper = __decorate([
        aurelia_framework_1.autoinject(),
        aurelia_framework_1.transient(),
        ag_grid_community_1.Bean("frameworkComponentWrapper"),
        __metadata("design:paramtypes", [aurelia_framework_1.TaskQueue, aurelia_framework_1.ViewCompiler])
    ], AureliaFrameworkComponentWrapper);
    return AureliaFrameworkComponentWrapper;
}(ag_grid_community_1.BaseComponentWrapper));
exports.AureliaFrameworkComponentWrapper = AureliaFrameworkComponentWrapper;
var BaseGuiComponent = /** @class */ (function () {
    function BaseGuiComponent(taskQueue, viewCompiler) {
        this._taskQueue = taskQueue;
        this._viewCompiler = viewCompiler;
    }
    BaseGuiComponent.prototype.init = function (params, template, viewResources, container) {
        var _this = this;
        this._params = params;
        var bindingContext = { params: params };
        var viewFactory = this._viewCompiler.compile(template, viewResources);
        this._view = viewFactory.create(container);
        var controllers = this._view.controllers;
        //initialize each controller
        if (controllers && controllers.length) {
            controllers.forEach(function (c) {
                c.viewModel.params = params;
            });
            this._view.bind(bindingContext);
            //ICellRenderer doesn't have a guiAttached method so
            //we call attach on the queue;
            this._taskQueue.queueMicroTask(function () { return _this._view.attached(); });
        }
        else {
            this._view.bind(bindingContext);
        }
    };
    BaseGuiComponent.prototype.getGui = function () {
        return this._view.fragment;
    };
    BaseGuiComponent.prototype.destroy = function () {
        this._view.returnToCache();
    };
    BaseGuiComponent.prototype.refresh = function (params) {
        return false;
    };
    BaseGuiComponent.prototype.getFrameworkComponentInstance = function () {
        var controllers = this._view.controllers;
        //only one controller is allowed in editor template
        if (controllers &&
            controllers.length == 1 &&
            controllers[0].viewModel) {
            var editorVm = controllers[0].viewModel;
            //this is a 'hack' because we don't have params.bind="" in the template
            //must reset params or it will be nothing
            editorVm.params = this._params;
            return editorVm;
        }
        return null;
    };
    return BaseGuiComponent;
}());
