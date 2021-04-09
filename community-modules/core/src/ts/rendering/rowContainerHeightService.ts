import { BeanStub } from "../context/beanStub";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Events } from "../eventKeys";
import { GridBodyComp } from "../gridBodyComp/gridBodyComp";
import { getMaxDivHeight } from "../utils/browser";
import { ControllersService } from "../controllersService";

/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */

@Bean('rowContainerHeightService')
export class RowContainerHeightService extends BeanStub {

    @Autowired('controllersService') private controllersService: ControllersService;

    private maxDivHeight: number;

    // if false, then scaling is not active, logic in this class is not used,
    // the pixel height of the row container matches what is actually needed,
    // no scaling applied.
    private scaling: boolean;

    private modelHeight: number | null; // how many pixels the model needs
    private uiContainerHeight: number | null; // how many pixels we actually have
    private pixelsToShave: number; // the number of pixels we need to shave

    // the number of pixels we add to each rowTop - depends on the scroll position
    private offset: number;

    // the scrollY position
    private scrollY = 0;
    // how tall the body is
    private uiBodyHeight = 0;

    // the max scroll position
    private maxScrollY: number;

    @PostConstruct
    private postConstruct(): void {
        this.addManagedListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.updateOffset.bind(this));
        this.maxDivHeight = getMaxDivHeight();
    }

    public isScaling(): boolean {
        return this.scaling;
    }

    public getOffset(): number {
        return this.offset;
    }

    public updateOffset(): void {
        if (!this.scaling) { return; }

        const gridBodyCon = this.controllersService.getGridBodyController();
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

        this.setOffset(scrollPercent * this.pixelsToShave);
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
        this.setOffset(0);
    }

    private setOffset(newOffset: number): void {
        // because we are talking pixels, no point in confusing things with half numbers
        const newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.offset === newOffsetFloor) { return; }

        this.offset = newOffsetFloor!;
        this.eventService.dispatchEvent({type: Events.EVENT_HEIGHT_SCALE_CHANGED});
    }

    public setModelHeight(modelHeight: number | null): void {
        this.modelHeight = modelHeight;
        this.scaling = modelHeight != null // null happens when in print layout
                        && this.maxDivHeight > 0
                        && modelHeight! > this.maxDivHeight;
        if (this.scaling) {
            this.calculateOffset();
        } else {
            this.clearOffset();
        }
    }

    public getUiContainerHeight(): number | null {
        return this.uiContainerHeight;
    }

    public getRealPixelPosition(modelPixel: number): number {
        return modelPixel - this.offset;
    }

    private getUiBodyHeight(): number {
        const gridBodyCon = this.controllersService.getGridBodyController();
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
