"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const beanStub_1 = require("./context/beanStub");
const context_1 = require("./context/context");
const logger_1 = require("./logger");
const moduleNames_1 = require("./modules/moduleNames");
const moduleRegistry_1 = require("./modules/moduleRegistry");
const eventKeys_1 = require("./eventKeys");
let SyncService = class SyncService extends beanStub_1.BeanStub {
    constructor() {
        super(...arguments);
        this.waitingForColumns = false;
    }
    postConstruct() {
        this.addManagedPropertyListener('columnDefs', (event) => this.setColumnDefs(event));
    }
    start() {
        // we wait until the UI has finished initialising before setting in columns and rows
        this.ctrlsService.whenReady(() => {
            const columnDefs = this.gridOptionsService.get('columnDefs');
            if (columnDefs) {
                this.setColumnsAndData(columnDefs);
            }
            else {
                this.waitingForColumns = true;
            }
            this.gridReady();
        });
    }
    setColumnsAndData(columnDefs) {
        this.columnModel.setColumnDefs(columnDefs !== null && columnDefs !== void 0 ? columnDefs : [], "gridInitializing");
        this.rowModel.start();
    }
    gridReady() {
        this.dispatchGridReadyEvent();
        const isEnterprise = moduleRegistry_1.ModuleRegistry.__isRegistered(moduleNames_1.ModuleNames.EnterpriseCoreModule, this.context.getGridId());
        const logger = new logger_1.Logger('AG Grid', () => this.gridOptionsService.get('debug'));
        logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
    }
    dispatchGridReadyEvent() {
        const readyEvent = {
            type: eventKeys_1.Events.EVENT_GRID_READY,
        };
        this.eventService.dispatchEvent(readyEvent);
    }
    setColumnDefs(event) {
        var _a;
        const columnDefs = this.gridOptionsService.get('columnDefs');
        if (!columnDefs) {
            return;
        }
        if (this.waitingForColumns) {
            this.waitingForColumns = false;
            this.setColumnsAndData(columnDefs);
            return;
        }
        const source = (_a = event.source) !== null && _a !== void 0 ? _a : 'api';
        this.columnModel.setColumnDefs(columnDefs, source);
    }
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
exports.SyncService = SyncService;
