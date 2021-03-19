import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { RefSelector } from "../widgets/componentAnnotations";
import { addOrRemoveCssClass } from "../utils/dom";
import { Events } from "../eventKeys";
import { MaxDivHeightScaler } from "../rendering/maxDivHeightScaler";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export interface GridBodyView extends  LayoutView {
    setProps(params: {enableRtl: boolean, printLayout: boolean}): void;
    setRowAnimationCssOnBodyViewport(animate: boolean): void;
    resetTopViewportScrollLeft(): void;
    resetBottomViewportScrollLeft(): void;
}

export class GridBodyController extends BeanStub {

    @Autowired('maxDivHeightScaler') private heightScaler: MaxDivHeightScaler;

    private view: GridBodyView;

    private eTopViewport: HTMLElement;
    private eBottomViewport: HTMLElement;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private printLayout: boolean;

    constructor(params: {view: GridBodyView, eTopViewport: HTMLElement, eBottomViewport: HTMLElement}) {
        super();
        this.view = params.view;
        this.eTopViewport = params.eTopViewport;
        this.eBottomViewport = params.eBottomViewport;
    }

    @PostConstruct
    private postConstruct(): void {

        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();
        this.printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;
        this.view.setProps({printLayout: this.printLayout, enableRtl: this.enableRtl});

        this.createManagedBean(new LayoutFeature(this.view));

        this.setupRowAnimationCssClass();
    }

    private setupRowAnimationCssClass(): void {
        const listener = () => {
            // we don't want to use row animation if scaling, as rows jump strangely as you scroll,
            // when scaling and doing row animation.
            const animateRows = this.gridOptionsWrapper.isAnimateRows() && !this.heightScaler.isScaling();
            this.view.setRowAnimationCssOnBodyViewport(animateRows);
        };

        listener();

        this.addManagedListener(this.eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, listener);
    }

    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    public onTopViewportScrollLeft(): void {
        this.view.resetTopViewportScrollLeft();
    }
    public onBottomViewportScrollLeft(): void {
        this.view.resetBottomViewportScrollLeft();
    }
}
