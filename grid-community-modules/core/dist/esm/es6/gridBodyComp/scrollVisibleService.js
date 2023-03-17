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
import { Bean, Autowired, PostConstruct } from "../context/context";
import { BeanStub } from "../context/beanStub";
import { Events } from "../events";
let ScrollVisibleService = class ScrollVisibleService extends BeanStub {
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_COLUMNS_WIDTH_CHANGED, this.onDisplayedColumnsWidthChanged.bind(this));
    }
    onDisplayedColumnsChanged() {
        this.update();
    }
    onDisplayedColumnsWidthChanged() {
        this.update();
    }
    update() {
        // because of column animation (which takes 200ms), we have to do this twice.
        // eg if user removes cols anywhere except at the RHS, then the cols on the RHS
        // will animate to the left to fill the gap. this animation means just after
        // the cols are removed, the remaining cols are still in the original location
        // at the start of the animation, so pre animation the H scrollbar is still needed,
        // but post animation it is not.
        this.updateImpl();
        setTimeout(this.updateImpl.bind(this), 500);
    }
    updateImpl() {
        const centerRowCtrl = this.ctrlsService.getCenterRowContainerCtrl();
        if (!centerRowCtrl) {
            return;
        }
        const params = {
            horizontalScrollShowing: centerRowCtrl.isHorizontalScrollShowing(),
            verticalScrollShowing: this.isVerticalScrollShowing()
        };
        this.setScrollsVisible(params);
    }
    setScrollsVisible(params) {
        const atLeastOneDifferent = this.horizontalScrollShowing !== params.horizontalScrollShowing ||
            this.verticalScrollShowing !== params.verticalScrollShowing;
        if (atLeastOneDifferent) {
            this.horizontalScrollShowing = params.horizontalScrollShowing;
            this.verticalScrollShowing = params.verticalScrollShowing;
            const event = {
                type: Events.EVENT_SCROLL_VISIBILITY_CHANGED
            };
            this.eventService.dispatchEvent(event);
        }
    }
    // used by pagination service - to know page height
    isHorizontalScrollShowing() {
        return this.horizontalScrollShowing;
    }
    // used by header container
    isVerticalScrollShowing() {
        return this.verticalScrollShowing;
    }
};
__decorate([
    Autowired('ctrlsService')
], ScrollVisibleService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], ScrollVisibleService.prototype, "postConstruct", null);
ScrollVisibleService = __decorate([
    Bean('scrollVisibleService')
], ScrollVisibleService);
export { ScrollVisibleService };
