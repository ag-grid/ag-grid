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
import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { debounce } from "../utils/function";
var PaginationAutoPageSizeService = /** @class */ (function (_super) {
    __extends(PaginationAutoPageSizeService, _super);
    function PaginationAutoPageSizeService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaginationAutoPageSizeService.prototype.postConstruct = function () {
        var _this = this;
        this.ctrlsService.whenReady(function (p) {
            _this.centerRowContainerCon = p.centerRowContainerCtrl;
            _this.addManagedListener(_this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, _this.checkPageSize.bind(_this));
            _this.addManagedListener(_this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, _this.checkPageSize.bind(_this));
            _this.addManagedPropertyListener('paginationAutoPageSize', _this.onPaginationAutoSizeChanged.bind(_this));
            _this.checkPageSize();
        });
    };
    PaginationAutoPageSizeService.prototype.notActive = function () {
        return !this.gridOptionsService.get('paginationAutoPageSize') || this.centerRowContainerCon == null;
    };
    PaginationAutoPageSizeService.prototype.onPaginationAutoSizeChanged = function () {
        if (this.notActive()) {
            this.paginationProxy.unsetAutoCalculatedPageSize();
        }
        else {
            this.checkPageSize();
        }
    };
    PaginationAutoPageSizeService.prototype.checkPageSize = function () {
        var _this = this;
        if (this.notActive()) {
            return;
        }
        var bodyHeight = this.centerRowContainerCon.getViewportSizeFeature().getBodyHeight();
        if (bodyHeight > 0) {
            var update_1 = function () {
                var rowHeight = _this.gridOptionsService.getRowHeightAsNumber();
                var newPageSize = Math.floor(bodyHeight / rowHeight);
                _this.paginationProxy.setPageSize(newPageSize, 'autoCalculated');
            };
            if (!this.isBodyRendered) {
                update_1();
                this.isBodyRendered = true;
            }
            else {
                debounce(function () { return update_1(); }, 50)();
            }
        }
        else {
            this.isBodyRendered = false;
        }
    };
    __decorate([
        Autowired('ctrlsService')
    ], PaginationAutoPageSizeService.prototype, "ctrlsService", void 0);
    __decorate([
        Autowired('paginationProxy')
    ], PaginationAutoPageSizeService.prototype, "paginationProxy", void 0);
    __decorate([
        PostConstruct
    ], PaginationAutoPageSizeService.prototype, "postConstruct", null);
    PaginationAutoPageSizeService = __decorate([
        Bean('paginationAutoPageSizeService')
    ], PaginationAutoPageSizeService);
    return PaginationAutoPageSizeService;
}(BeanStub));
export { PaginationAutoPageSizeService };
