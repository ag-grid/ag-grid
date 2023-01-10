/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
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
import { setDisplayed, setFixedWidth } from "../../utils/dom";
export class SetPinnedLeftWidthFeature extends BeanStub {
    constructor(element) {
        super();
        this.element = element;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_LEFT_PINNED_WIDTH_CHANGED, this.onPinnedLeftWidthChanged.bind(this));
    }
    onPinnedLeftWidthChanged() {
        const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
        const displayed = leftWidth > 0;
        setDisplayed(this.element, displayed);
        setFixedWidth(this.element, leftWidth);
    }
    getWidth() {
        return this.pinnedWidthService.getPinnedLeftWidth();
    }
}
__decorate([
    Autowired('pinnedWidthService')
], SetPinnedLeftWidthFeature.prototype, "pinnedWidthService", void 0);
__decorate([
    PostConstruct
], SetPinnedLeftWidthFeature.prototype, "postConstruct", null);
