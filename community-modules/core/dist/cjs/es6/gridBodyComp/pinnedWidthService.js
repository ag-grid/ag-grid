/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const gridOptionsWrapper_1 = require("../gridOptionsWrapper");
const eventKeys_1 = require("../eventKeys");
const constants_1 = require("../constants/constants");
let PinnedWidthService = class PinnedWidthService extends beanStub_1.BeanStub {
    postConstruct() {
        const listener = this.checkContainerWidths.bind(this);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.addManagedListener(this.gridOptionsWrapper, gridOptionsWrapper_1.GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
    }
    checkContainerWidths() {
        const printLayout = this.gridOptionsWrapper.getDomLayout() === constants_1.Constants.DOM_LAYOUT_PRINT;
        const newLeftWidth = printLayout ? 0 : this.columnModel.getDisplayedColumnsLeftWidth();
        const newRightWidth = printLayout ? 0 : this.columnModel.getDisplayedColumnsRightWidth();
        if (newLeftWidth != this.leftWidth) {
            this.leftWidth = newLeftWidth;
            this.eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_LEFT_PINNED_WIDTH_CHANGED });
        }
        if (newRightWidth != this.rightWidth) {
            this.rightWidth = newRightWidth;
            this.eventService.dispatchEvent({ type: eventKeys_1.Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED });
        }
    }
    getPinnedRightWidth() {
        return this.rightWidth;
    }
    getPinnedLeftWidth() {
        return this.leftWidth;
    }
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
exports.PinnedWidthService = PinnedWidthService;
