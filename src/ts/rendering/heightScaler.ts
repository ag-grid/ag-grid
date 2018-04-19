import {BeanStub} from "../context/beanStub";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {EventService} from "../eventService";
import {Events} from "../eventKeys";
import {GridPanel} from "../gridPanel/gridPanel";
import {_} from "../utils";

/**
 * This class solves the 'max height' problem, where the user might want to show more data than
 * the max div height actually allows.
 */

@Bean('heightScaler')
export class HeightScaler extends BeanStub {

    @Autowired('eventService') private eventService: EventService;

    private gridPanel: GridPanel;

    private maxDivHeight: number;

    // if false, then scaling is not active, logic in this class is not used,
    // the pixel height of the row container matches what is actually needed,
    // no scaling applied.
    private scaling: boolean;

    private modelHeight: number; // how many pixels the model needs
    private uiContainerHeight: number; // how many pixels we actually have
    private pixelsToShave: number; // the number of pixels we need to shave

    // the number of pixels we add to each rowTop - depends on the scroll position
    private offset: number;

    // the scrollY position
    private scrollY = 0;
    // how tall the body is
    private uiBodyHeight = 0;

    // the max scroll position
    private maxScrollY: number;

    // we need this for the maths, as it impacts the grid height
    private scrollBarWidth: number;

    @PostConstruct
    private postConstruct(): void {
        this.addDestroyableEventListener(this.eventService, Events.EVENT_BODY_HEIGHT_CHANGED, this.update.bind(this));
        this.scrollBarWidth = _.getScrollbarWidth();
        this.maxDivHeight = _.getMaxDivHeight();
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    public isScaling(): boolean {
        return this.scaling;
    }

    public getOffset(): number {
        return this.offset;
    }

    public update(): void {
        if (!this.scaling) { return; }

        let newScrollY = this.gridPanel.getVScrollPosition().top;
        let newBodyHeight = this.getUiBodyHeight();

        let atLeastOneChanged = newScrollY!==this.scrollY || newBodyHeight!==this.uiBodyHeight;
        if (atLeastOneChanged) {
            this.scrollY = newScrollY;
            this.uiBodyHeight = newBodyHeight;
            this.calculateOffset();
        }
    }

    private calculateOffset(): void {
        this.uiContainerHeight = this.maxDivHeight;
        this.pixelsToShave = this.modelHeight - this.uiContainerHeight;

        this.maxScrollY = this.uiContainerHeight - this.uiBodyHeight;
        let scrollPercent = this.scrollY / this.maxScrollY;

        this.setOffset(scrollPercent * this.pixelsToShave);
    }

    private clearOffset(): void {
        this.uiContainerHeight = this.modelHeight;
        this.pixelsToShave = 0;

        this.setOffset(0);
    }

    private setOffset(newOffset: number): void {
        // because we are talking pixels, no point in confusing things with half numbers
        let newOffsetFloor = typeof newOffset === 'number' ? Math.floor(newOffset) : null;
        if (this.offset!==newOffsetFloor) {
            this.offset = newOffsetFloor;
            this.eventService.dispatchEvent({type: Events.EVENT_HEIGHT_SCALE_CHANGED});
        }
    }

    public setModelHeight(modelHeight: number): void {
        this.modelHeight = modelHeight;
        this.scaling = this.maxDivHeight > 0 && modelHeight > this.maxDivHeight;
        if (this.scaling) {
            this.calculateOffset();
        } else {
            this.clearOffset();
        }
    }

    public getUiContainerHeight(): number {
        return this.uiContainerHeight;
    }

    public getRealPixelPosition(modelPixel: number): number {
        let uiPixel = modelPixel - this.offset;
        return uiPixel;
    }

    private getUiBodyHeight(): number {
        let pos = this.gridPanel.getVScrollPosition();
        let bodyHeight = pos.bottom - pos.top;
        if (this.gridPanel.isHorizontalScrollShowing()) {
            bodyHeight -= this.scrollBarWidth;
        }
        return bodyHeight;
    }

    public getScrollPositionForPixel(rowTop: number): number {
        if (this.pixelsToShave<=0) {
            return rowTop;
        } else {
            let modelMaxScroll = this.modelHeight - this.getUiBodyHeight();
            let scrollPercent = rowTop / modelMaxScroll;
            let scrollPixel = this.maxScrollY * scrollPercent;
            return scrollPixel;
        }
    }
}