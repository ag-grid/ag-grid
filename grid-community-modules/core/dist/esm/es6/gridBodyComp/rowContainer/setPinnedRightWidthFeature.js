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
import { Autowired, PostConstruct } from "../../context/context";
import { Events } from "../../eventKeys";
import { setDisplayed, setFixedWidth } from "../../utils/dom";
import { BeanStub } from "../../context/beanStub";
export class SetPinnedRightWidthFeature extends BeanStub {
    constructor(element) {
        super();
        this.element = element;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_RIGHT_PINNED_WIDTH_CHANGED, this.onPinnedRightWidthChanged.bind(this));
    }
    onPinnedRightWidthChanged() {
        const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
        const displayed = rightWidth > 0;
        setDisplayed(this.element, displayed);
        setFixedWidth(this.element, rightWidth);
    }
    getWidth() {
        return this.pinnedWidthService.getPinnedRightWidth();
    }
}
__decorate([
    Autowired('pinnedWidthService')
], SetPinnedRightWidthFeature.prototype, "pinnedWidthService", void 0);
__decorate([
    PostConstruct
], SetPinnedRightWidthFeature.prototype, "postConstruct", null);
