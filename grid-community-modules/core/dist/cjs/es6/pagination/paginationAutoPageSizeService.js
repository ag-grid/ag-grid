"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationAutoPageSizeService = void 0;
const beanStub_1 = require("../context/beanStub");
const events_1 = require("../events");
const context_1 = require("../context/context");
const function_1 = require("../utils/function");
let PaginationAutoPageSizeService = class PaginationAutoPageSizeService extends beanStub_1.BeanStub {
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;
            this.addManagedListener(this.eventService, events_1.Events.EVENT_BODY_HEIGHT_CHANGED, this.checkPageSize.bind(this));
            this.addManagedListener(this.eventService, events_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.checkPageSize.bind(this));
            this.addManagedPropertyListener('paginationAutoPageSize', this.onPaginationAutoSizeChanged.bind(this));
            this.checkPageSize();
        });
    }
    notActive() {
        return !this.gridOptionsService.get('paginationAutoPageSize') || this.centerRowContainerCon == null;
    }
    onPaginationAutoSizeChanged() {
        if (this.notActive()) {
            this.paginationProxy.unsetAutoCalculatedPageSize();
        }
        else {
            this.checkPageSize();
        }
    }
    checkPageSize() {
        if (this.notActive()) {
            return;
        }
        const bodyHeight = this.centerRowContainerCon.getViewportSizeFeature().getBodyHeight();
        if (bodyHeight > 0) {
            const update = () => {
                const rowHeight = this.gridOptionsService.getRowHeightAsNumber();
                const newPageSize = Math.floor(bodyHeight / rowHeight);
                this.paginationProxy.setPageSize(newPageSize, 'autoCalculated');
            };
            if (!this.isBodyRendered) {
                update();
                this.isBodyRendered = true;
            }
            else {
                (0, function_1.debounce)(() => update(), 50)();
            }
        }
        else {
            this.isBodyRendered = false;
        }
    }
};
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], PaginationAutoPageSizeService.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Autowired)('paginationProxy')
], PaginationAutoPageSizeService.prototype, "paginationProxy", void 0);
__decorate([
    context_1.PostConstruct
], PaginationAutoPageSizeService.prototype, "postConstruct", null);
PaginationAutoPageSizeService = __decorate([
    (0, context_1.Bean)('paginationAutoPageSizeService')
], PaginationAutoPageSizeService);
exports.PaginationAutoPageSizeService = PaginationAutoPageSizeService;
