var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "./context/beanStub.mjs";
import { Autowired, Bean, PostConstruct } from "./context/context.mjs";
import { Logger } from "./logger.mjs";
import { ModuleNames } from "./modules/moduleNames.mjs";
import { ModuleRegistry } from "./modules/moduleRegistry.mjs";
import { Events } from "./eventKeys.mjs";
let SyncService = class SyncService extends BeanStub {
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
        const isEnterprise = ModuleRegistry.__isRegistered(ModuleNames.EnterpriseCoreModule, this.context.getGridId());
        const logger = new Logger('AG Grid', () => this.gridOptionsService.get('debug'));
        logger.log(`initialised successfully, enterprise = ${isEnterprise}`);
    }
    dispatchGridReadyEvent() {
        const readyEvent = {
            type: Events.EVENT_GRID_READY,
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
    Autowired('ctrlsService')
], SyncService.prototype, "ctrlsService", void 0);
__decorate([
    Autowired('columnModel')
], SyncService.prototype, "columnModel", void 0);
__decorate([
    Autowired('rowModel')
], SyncService.prototype, "rowModel", void 0);
__decorate([
    PostConstruct
], SyncService.prototype, "postConstruct", null);
SyncService = __decorate([
    Bean('syncService')
], SyncService);
export { SyncService };
