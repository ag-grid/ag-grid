"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
var beanStub_1 = require("./context/beanStub");
var context_1 = require("./context/context");
var logger_1 = require("./logger");
var moduleNames_1 = require("./modules/moduleNames");
var moduleRegistry_1 = require("./modules/moduleRegistry");
var eventKeys_1 = require("./eventKeys");
var SyncService = /** @class */ (function (_super) {
    __extends(SyncService, _super);
    function SyncService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.waitingForColumns = false;
        return _this;
    }
    SyncService.prototype.postConstruct = function () {
        var _this = this;
        this.addManagedPropertyListener('columnDefs', function (event) { return _this.setColumnDefs(event); });
    };
    SyncService.prototype.start = function () {
        var _this = this;
        // we wait until the UI has finished initialising before setting in columns and rows
        this.ctrlsService.whenReady(function () {
            var columnDefs = _this.gridOptionsService.get('columnDefs');
            if (columnDefs) {
                _this.setColumnsAndData(columnDefs);
            }
            else {
                _this.waitingForColumns = true;
            }
            _this.gridReady();
        });
    };
    SyncService.prototype.setColumnsAndData = function (columnDefs) {
        this.columnModel.setColumnDefs(columnDefs !== null && columnDefs !== void 0 ? columnDefs : [], "gridInitializing");
        this.rowModel.start();
    };
    SyncService.prototype.gridReady = function () {
        var _this = this;
        this.dispatchGridReadyEvent();
        var isEnterprise = moduleRegistry_1.ModuleRegistry.__isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule, this.context.getGridId());
        var logger = new logger_1.Logger('AG Grid', function () { return _this.gridOptionsService.get('debug'); });
        logger.log("initialised successfully, enterprise = ".concat(isEnterprise));
    };
    SyncService.prototype.dispatchGridReadyEvent = function () {
        var readyEvent = {
            type: eventKeys_1.Events.EVENT_GRID_READY,
        };
        this.eventService.dispatchEvent(readyEvent);
    };
    SyncService.prototype.setColumnDefs = function (event) {
        var _a;
        var columnDefs = this.gridOptionsService.get('columnDefs');
        if (!columnDefs) {
            return;
        }
        if (this.waitingForColumns) {
            this.waitingForColumns = false;
            this.setColumnsAndData(columnDefs);
            return;
        }
        var source = (_a = event.source) !== null && _a !== void 0 ? _a : 'api';
        this.columnModel.setColumnDefs(columnDefs, source);
    };
    __decorate([
        (0, context_1.Autowired)('ctrlsService')
    ], SyncService.prototype, "ctrlsService", void 0);
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], SyncService.prototype, "columnModel", void 0);
    __decorate([
        (0, context_1.Autowired)('rowModel')
    ], SyncService.prototype, "rowModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], SyncService.prototype, "postConstruct", null);
    SyncService = __decorate([
        (0, context_1.Bean)('syncService')
    ], SyncService);
    return SyncService;
}(beanStub_1.BeanStub));
exports.SyncService = SyncService;
