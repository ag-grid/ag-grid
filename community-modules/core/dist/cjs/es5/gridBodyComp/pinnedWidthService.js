/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinnedWidthService = void 0;
var beanStub_1 = require("../context/beanStub");
var context_1 = require("../context/context");
var eventKeys_1 = require("../eventKeys");
var PinnedWidthService = /** @class */ (function (_super) {
    __extends(PinnedWidthService, _super);
    function PinnedWidthService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PinnedWidthService.prototype.postConstruct = function () {
        var listener = this.checkContainerWidths.bind(this);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.addManagedPropertyListener('domLayout', listener);
    };
    PinnedWidthService.prototype.checkContainerWidths = function () {
        var printLayout = this.gridOptionsService.isDomLayout('print');
        var newLeftWidth = printLayout ? 0 : this.columnModel.getDisplayedColumnsLeftWidth();
        var newRightWidth = printLayout ? 0 : this.columnModel.getDisplayedColumnsRightWidth();
        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            this.eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_LEFT_PINNED_WIDTH_CHANGED });
        }
        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            this.eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED });
        }
    };
    PinnedWidthService.prototype.getPinnedRightWidth = function () {
        return this.rightWidth;
    };
    PinnedWidthService.prototype.getPinnedLeftWidth = function () {
        return this.leftWidth;
    };
    __decorate([
        context_1.Autowired('columnModel')
    ], PinnedWidthService.prototype, "columnModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], PinnedWidthService.prototype, "postConstruct", null);
    PinnedWidthService = __decorate([
        context_1.Bean('pinnedWidthService')
    ], PinnedWidthService);
    return PinnedWidthService;
}(beanStub_1.BeanStub));
exports.PinnedWidthService = PinnedWidthService;
