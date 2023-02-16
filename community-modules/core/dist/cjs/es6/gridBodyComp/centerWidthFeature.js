/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
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
exports.CenterWidthFeature = void 0;
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
class CenterWidthFeature extends beanStub_1.BeanStub {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    postConstruct() {
        const listener = this.setWidth.bind(this);
        this.addManagedPropertyListener('domLayout', listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, listener);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, listener);
        this.setWidth();
    }
    setWidth() {
        const { columnModel } = this;
        const printLayout = this.gridOptionsService.isDomLayout('print');
        const centerWidth = columnModel.getBodyContainerWidth();
        const leftWidth = columnModel.getDisplayedColumnsLeftWidth();
        const rightWidth = columnModel.getDisplayedColumnsRightWidth();
        const totalWidth = printLayout ? centerWidth + leftWidth + rightWidth : centerWidth;
        this.callback(totalWidth);
    }
}
__decorate([
    context_1.Autowired('columnModel')
], CenterWidthFeature.prototype, "columnModel", void 0);
__decorate([
    context_1.PostConstruct
], CenterWidthFeature.prototype, "postConstruct", null);
exports.CenterWidthFeature = CenterWidthFeature;
