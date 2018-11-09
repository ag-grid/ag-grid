// ag-grid-aurelia v19.1.2
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
var ag_grid_community_1 = require("ag-grid-community");
var aureliaFrameworkFactory_1 = require("./aureliaFrameworkFactory");
var agUtils_1 = require("./agUtils");
var agTemplate_1 = require("./agTemplate");
var aureliaFrameworkComponentWrapper_1 = require("./aureliaFrameworkComponentWrapper");
var AgGridAurelia = /** @class */ (function () {
    function AgGridAurelia(element, taskQueue, auFrameworkFactory, container, viewResources, aureliaFrameworkComponentWrapper) {
        var _this = this;
        this.taskQueue = taskQueue;
        this.auFrameworkFactory = auFrameworkFactory;
        this.container = container;
        this.viewResources = viewResources;
        this.aureliaFrameworkComponentWrapper = aureliaFrameworkComponentWrapper;
        this._initialised = false;
        this._destroyed = false;
        this.columns = [];
        this._nativeElement = element;
        // create all the events generically. this is done generically so that
        // if the list of grid events change, we don't need to change this code.
        ag_grid_community_1.ComponentUtil.EVENTS.forEach(function (eventName) {
            //create an empty event
            _this[eventName] = function () {
            };
        });
    }
    AgGridAurelia.prototype.attached = function () {
        // initialize the grid in the queue
        // because of bug in @children
        // https://github.com/aurelia/templating/issues/403
        this.taskQueue.queueTask(this.initGrid.bind(this));
    };
    AgGridAurelia.prototype.initGrid = function () {
        this._initialised = false;
        this._destroyed = false;
        this.auFrameworkFactory.setContainer(this.container);
        this.auFrameworkFactory.setViewResources(this.viewResources);
        this.aureliaFrameworkComponentWrapper.setContainer(this.container);
        this.aureliaFrameworkComponentWrapper.setViewResources(this.viewResources);
        this.gridOptions = ag_grid_community_1.ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this);
        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkFactory: this.auFrameworkFactory,
            seedBeanInstances: {
                frameworkComponentWrapper: this.aureliaFrameworkComponentWrapper
            }
        };
        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map(function (column) {
                return column.toColDef();
            });
        }
        if (this.fullWidthRowTemplate) {
            this.gridOptions.fullWidthCellRendererFramework =
                { template: this.fullWidthRowTemplate.template };
        }
        if (this.dateTemplate) {
            this.gridOptions.dateComponentFramework =
                { template: this.dateTemplate.template };
        }
        new ag_grid_community_1.Grid(this._nativeElement, this.gridOptions, this.gridParams);
        this.api = this.gridOptions.api;
        this.columnApi = this.gridOptions.columnApi;
        this._initialised = true;
    };
    /**
     * Called by Aurelia whenever a bound property changes
     */
    AgGridAurelia.prototype.propertyChanged = function (propertyName, newValue, oldValue) {
        // emulate an Angular2 SimpleChanges Object
        var changes = {};
        changes[propertyName] = { currentValue: newValue, previousValue: oldValue };
        if (this._initialised) {
            ag_grid_community_1.ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    };
    AgGridAurelia.prototype.detached = function () {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            this.api.destroy();
        }
    };
    AgGridAurelia.prototype.globalEventListener = function (eventType, event) {
        // if we are tearing down, don't emit events
        if (this._destroyed) {
            return;
        }
        // generically look up the eventType
        var emitter = this[eventType];
        if (emitter) {
            emitter(event);
        }
        else {
            console.log('ag-Grid-aurelia: could not find EventEmitter: ' + eventType);
        }
    };
    __decorate([
        aurelia_framework_1.bindable(),
        __metadata("design:type", Object)
    ], AgGridAurelia.prototype, "gridOptions", void 0);
    __decorate([
        aurelia_framework_1.bindable(),
        __metadata("design:type", Object)
    ], AgGridAurelia.prototype, "context", void 0);
    __decorate([
        aurelia_framework_1.children('ag-grid-column'),
        __metadata("design:type", Array)
    ], AgGridAurelia.prototype, "columns", void 0);
    __decorate([
        aurelia_framework_1.child('ag-full-width-row-template'),
        __metadata("design:type", agTemplate_1.AgFullWidthRowTemplate)
    ], AgGridAurelia.prototype, "fullWidthRowTemplate", void 0);
    __decorate([
        aurelia_framework_1.child('ag-date-template'),
        __metadata("design:type", agTemplate_1.AgDateTemplate)
    ], AgGridAurelia.prototype, "dateTemplate", void 0);
    AgGridAurelia = __decorate([
        aurelia_framework_1.customElement('ag-grid-aurelia'),
        agUtils_1.generateBindables(ag_grid_community_1.ComponentUtil.ALL_PROPERTIES.filter(function (property) { return property !== 'gridOptions'; })),
        agUtils_1.generateBindables(ag_grid_community_1.ComponentUtil.EVENTS)
        // <slot> is required for @children to work.  https://github.com/aurelia/templating/issues/451#issuecomment-254206622
        ,
        aurelia_framework_1.inlineView("<template><slot></slot></template>"),
        aurelia_framework_1.autoinject(),
        __metadata("design:paramtypes", [Element,
            aurelia_framework_1.TaskQueue,
            aureliaFrameworkFactory_1.AureliaFrameworkFactory,
            aurelia_framework_1.Container,
            aurelia_framework_1.ViewResources,
            aureliaFrameworkComponentWrapper_1.AureliaFrameworkComponentWrapper])
    ], AgGridAurelia);
    return AgGridAurelia;
}());
exports.AgGridAurelia = AgGridAurelia;
