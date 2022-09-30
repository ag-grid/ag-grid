/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, Qualifier } from "../context/context";
import { Events } from "../eventKeys";
import { getMaxDivHeight } from "../utils/browser";
/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */
let RowContainerHeightService = class RowContainerHeightService extends BeanStub {
    constructor() {
        super(...arguments);
        // the scrollY position
        this.scrollY = 0;
        // how tall the body is
        this.uiBodyHeight = 0;
    }
    agWire(loggerFactory) {
        this.logger = loggerFactory.create("RowContainerHeightService");
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.updateOffset.bind(this));
        this.maxDivHeight = getMaxDivHeight();
        this.logger.log('maxDivHeight = ' + this.maxDivHeight);
    }
    isStretching() {
        return this.stretching;
    }
    getDivStretchOffset() {
        return this.divStretchOffset;
    }
    updateOffset() {
        if (!this.stretching) {
            return;
        }
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const newScrollY = gridBodyCon.getScrollFeature().getVScrollPosition().top;
        const newBodyHeight = this.getUiBodyHeight();
        const atLeastOneChanged = newScrollY !== this.scrollY || newBodyHeight !== this.uiBodyHeight;
        if (atLeastOneChanged) {
            this.scrollY = newScrollY;
            this.uiBodyHeight = newBodyHeight;
            this.calculateOffset();
        }
    }
    calculateOffset() {
        this.setUiContainerHeight(this.maxDivHeight);
        this.pixelsToShave = this.modelHeight - this.uiContainerHeight;
        this.maxScrollY = this.uiContainerHeight - this.uiBodyHeight;
        const scrollPercent = this.scrollY / this.maxScrollY;
        const divStretchOffset = scrollPercent * this.pixelsToShave;
        this.logger.log(`Div Stretch Offset = ${divStretchOffset} (${this.pixelsToShave} * ${scrollPercent})`);
        this.setDivStretchOffset(divStretchOffset);
    }
    setUiContainerHeight(height) {
        if (height !== this.uiContainerHeight) {
            this.uiContainerHeight = height;
            this.eventService.dispatchEvent({ type: Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED });
        }
    }
    clearOffset() {
        this.setUiContainerHeight(this.modelHeight);
        this.pixelsToShave = 0;
        this.setDivStretchOffset(0);
    }
    setDivStretchOffset(newOffset) {
        // because we are talking pixels, no point in confusing things with half numbers
        const newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.divStretchOffset === newOffsetFloor) {
            return;
        }
        this.divStretchOffset = newOffsetFloor;
        this.eventService.dispatchEvent({ type: Events.EVENT_HEIGHT_SCALE_CHANGED });
    }
    setModelHeight(modelHeight) {
        this.modelHeight = modelHeight;
        this.stretching = modelHeight != null // null happens when in print layout
            && this.maxDivHeight > 0
            && modelHeight > this.maxDivHeight;
        if (this.stretching) {
            this.calculateOffset();
        }
        else {
            this.clearOffset();
        }
    }
    getUiContainerHeight() {
        return this.uiContainerHeight;
    }
    getRealPixelPosition(modelPixel) {
        return modelPixel - this.divStretchOffset;
    }
    getUiBodyHeight() {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const pos = gridBodyCon.getScrollFeature().getVScrollPosition();
        return pos.bottom - pos.top;
    }
    getScrollPositionForPixel(rowTop) {
        if (this.pixelsToShave <= 0) {
            return rowTop;
        }
        const modelMaxScroll = this.modelHeight - this.getUiBodyHeight();
        const scrollPercent = rowTop / modelMaxScroll;
        const scrollPixel = this.maxScrollY * scrollPercent;
        return scrollPixel;
    }
};
__decorate([
    Autowired('ctrlsService')
], RowContainerHeightService.prototype, "ctrlsService", void 0);
__decorate([
    __param(0, Qualifier("loggerFactory"))
], RowContainerHeightService.prototype, "agWire", null);
__decorate([
    PostConstruct
], RowContainerHeightService.prototype, "postConstruct", null);
RowContainerHeightService = __decorate([
    Bean('rowContainerHeightService')
], RowContainerHeightService);
export { RowContainerHeightService };
