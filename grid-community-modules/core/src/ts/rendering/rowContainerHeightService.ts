import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct, Qualifier } from "../context/context";
import { Events } from "../eventKeys";
import { getMaxDivHeight } from "../utils/browser";
import { CtrlsService } from "../ctrlsService";
import { Logger, LoggerFactory } from "../logger";

/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */

@Bean('rowContainerHeightService')
export class RowContainerHeightService extends BeanStub {

    @Autowired('ctrlsService') private ctrlsService: CtrlsService;

    private maxDivHeight: number;

    // if false, then stretching is not active, logic in this class is not used,
    // the pixel height of the row container matches what is actually needed,
    // no scaling applied.
    private stretching: boolean;

    private modelHeight: number | null; // how many pixels the model needs
    private uiContainerHeight: number | null; // how many pixels we actually have
    private pixelsToShave: number; // the number of pixels we need to shave

    // the number of pixels we add to each rowTop - depends on the scroll position
    private divStretchOffset: number;

    // the scrollY position
    private scrollY = 0;
    // how tall the body is
    private uiBodyHeight = 0;

    // the max scroll position
    private maxScrollY: number;

    private logger: Logger;

    public agWire(@Qualifier("loggerFactory") loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create("RowContainerHeightService");
    }

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.updateOffset.bind(this));
        this.maxDivHeight = getMaxDivHeight();
        this.logger.log('maxDivHeight = ' + this.maxDivHeight);
    }

    public isStretching(): boolean {
        return this.stretching;
    }

    public getDivStretchOffset(): number {
        return this.divStretchOffset;
    }

    public updateOffset(): void {
        if (!this.stretching) { return; }

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

    private calculateOffset(): void {
        this.setUiContainerHeight(this.maxDivHeight);
        this.pixelsToShave = this.modelHeight! - this.uiContainerHeight!;

        this.maxScrollY = this.uiContainerHeight! - this.uiBodyHeight;
        const scrollPercent = this.scrollY / this.maxScrollY;

        const divStretchOffset = scrollPercent * this.pixelsToShave;

        this.logger.log(`Div Stretch Offset = ${divStretchOffset} (${this.pixelsToShave} * ${scrollPercent})`);

        this.setDivStretchOffset(divStretchOffset);
    }

    private setUiContainerHeight(height: number | null): void {
        if (height !== this.uiContainerHeight) {
            this.uiContainerHeight = height;
            this.eventService.dispatchEvent({type: Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED});
        }
    }

    private clearOffset(): void {
        this.setUiContainerHeight(this.modelHeight);
        this.pixelsToShave = 0;
        this.setDivStretchOffset(0);
    }

    private setDivStretchOffset(newOffset: number): void {
        // because we are talking pixels, no point in confusing things with half numbers
        const newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.divStretchOffset === newOffsetFloor) { return; }

        this.divStretchOffset = newOffsetFloor!;
        this.eventService.dispatchEvent({type: Events.EVENT_HEIGHT_SCALE_CHANGED});
    }

    public setModelHeight(modelHeight: number | null): void {
        this.modelHeight = modelHeight;
        this.stretching = modelHeight != null // null happens when in print layout
                        && this.maxDivHeight > 0
                        && modelHeight! > this.maxDivHeight;
        if (this.stretching) {
            this.calculateOffset();
        } else {
            this.clearOffset();
        }
    }

    public getUiContainerHeight(): number | null {
        return this.uiContainerHeight;
    }

    public getRealPixelPosition(modelPixel: number): number {
        return modelPixel - this.divStretchOffset;
    }

    private getUiBodyHeight(): number {
        const gridBodyCon = this.ctrlsService.getGridBodyCtrl();
        const pos = gridBodyCon.getScrollFeature().getVScrollPosition();
        return pos.bottom - pos.top;
    }

    public getScrollPositionForPixel(rowTop: number): number {
        if (this.pixelsToShave <= 0) { return rowTop; }

        const modelMaxScroll = this.modelHeight! - this.getUiBodyHeight();
        const scrollPercent = rowTop / modelMaxScroll;
        const scrollPixel = this.maxScrollY * scrollPercent;
        return scrollPixel;
    }
}
