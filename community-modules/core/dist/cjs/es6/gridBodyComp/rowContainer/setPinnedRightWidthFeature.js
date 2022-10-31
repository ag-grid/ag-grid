/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
const context_1 = require("../../context/context");
const eventKeys_1 = require("../../eventKeys");
const dom_1 = require("../../utils/dom");
const beanStub_1 = require("../../context/beanStub");
class SetPinnedRightWidthFeature extends beanStub_1.BeanStub {
    constructor(element) {
        super();
        this.element = element;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
    }
    onPinnedRightWidthChanged() {
        const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const displayed = rightWidth > 0;
        dom_1.setDisplayed(this.element, displayed);
        if (displayed) {
            dom_1.setFixedWidth(this.element, rightWidth);
        }
    }
}
__decorate([
    context_1.Autowired('pinnedWidthService')
], SetPinnedRightWidthFeature.prototype, "pinnedWidthService", void 0);
__decorate([
    context_1.PostConstruct
], SetPinnedRightWidthFeature.prototype, "postConstruct", null);
exports.SetPinnedRightWidthFeature = SetPinnedRightWidthFeature;
