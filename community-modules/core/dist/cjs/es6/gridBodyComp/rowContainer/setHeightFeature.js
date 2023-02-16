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
exports.SetHeightFeature = void 0;
const beanStub_1 = require("../../context/beanStub");
const context_1 = require("../../context/context");
const eventKeys_1 = require("../../eventKeys");
class SetHeightFeature extends beanStub_1.BeanStub {
    constructor(eContainer, eWrapper) {
        super();
        this.eContainer = eContainer;
        this.eWrapper = eWrapper;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onHeightChanged.bind(this));
    }
    onHeightChanged() {
        const height = this.maxDivHeightScaler.getUiContainerHeight();
        const heightString = height != null ? `${height}px` : ``;
        this.eContainer.style.height = heightString;
        if (this.eWrapper) {
            this.eWrapper.style.height = heightString;
        }
    }
}
__decorate([
    context_1.Autowired("rowContainerHeightService")
], SetHeightFeature.prototype, "maxDivHeightScaler", void 0);
__decorate([
    context_1.PostConstruct
], SetHeightFeature.prototype, "postConstruct", null);
exports.SetHeightFeature = SetHeightFeature;
