/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { debounce } from "../utils/function";
let PaginationAutoPageSizeService = class PaginationAutoPageSizeService extends BeanStub {
    postConstruct() {
        this.ctrlsService.whenReady(p => {
            this.centerRowContainerCon = p.centerRowContainerCtrl;
            this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.checkPageSize.bind(this));
            this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.checkPageSize.bind(this));
            this.checkPageSize();
        });
    }
    notActive() {
        return !this.gridOptionsService.is('paginationAutoPageSize') || this.centerRowContainerCon == null;
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
                this.gridOptionsService.set('paginationPageSize', newPageSize);
            };
            if (!this.isBodyRendered) {
                update();
                this.isBodyRendered = true;
            }
            else {
                debounce(() => update(), 50)();
            }
        }
        else {
            this.isBodyRendered = false;
        }
    }
};
__decorate([
    Autowired('ctrlsService')
], PaginationAutoPageSizeService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], PaginationAutoPageSizeService.prototype, "postConstruct", null);
PaginationAutoPageSizeService = __decorate([
    Bean('paginationAutoPageSizeService')
], PaginationAutoPageSizeService);
export { PaginationAutoPageSizeService };
