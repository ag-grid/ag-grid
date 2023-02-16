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
exports.DragListenerFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
const generic_1 = require("../../utils/generic");
const context_1 = require("../../context/context");
class DragListenerFeature extends beanStub_1.BeanStub {
    constructor(eContainer) {
        super();
        this.eContainer = eContainer;
    }
    postConstruct() {
        if (!this.gridOptionsService.isEnableRangeSelection() || // no range selection if no property
            generic_1.missing(this.rangeService) // no range selection if not enterprise version
        ) {
            return;
        }
        const params = {
            eElement: this.eContainer,
            onDragStart: this.rangeService.onDragStart.bind(this.rangeService),
            onDragStop: this.rangeService.onDragStop.bind(this.rangeService),
            onDragging: this.rangeService.onDragging.bind(this.rangeService)
        };
        this.dragService.addDragSource(params);
        this.addDestroyFunc(() => this.dragService.removeDragSource(params));
    }
}
__decorate([
    context_1.Optional('rangeService')
], DragListenerFeature.prototype, "rangeService", void 0);
__decorate([
    context_1.Autowired('dragService')
], DragListenerFeature.prototype, "dragService", void 0);
__decorate([
    context_1.PostConstruct
], DragListenerFeature.prototype, "postConstruct", null);
exports.DragListenerFeature = DragListenerFeature;
