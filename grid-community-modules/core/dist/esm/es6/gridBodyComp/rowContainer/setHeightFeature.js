/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BeanStub } from "../../context/beanStub";
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
export class SetHeightFeature extends BeanStub {
    constructor(eContainer, eWrapper) {
        super();
        this.eContainer = eContainer;
        this.eWrapper = eWrapper;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onHeightChanged.bind(this));
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
    Autowired("rowContainerHeightService")
], SetHeightFeature.prototype, "maxDivHeightScaler", void 0);
__decorate([
    PostConstruct
], SetHeightFeature.prototype, "postConstruct", null);
