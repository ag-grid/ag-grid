import { BeanStub } from "../context/beanStub";
import { Autowired, PostConstruct } from "../context/context";
import { LayoutFeature, LayoutView } from "../styling/layoutFeature";
import { Constants } from "../constants/constants";
import { Events } from "../eventKeys";
import { MaxDivHeightScaler } from "../rendering/maxDivHeightScaler";

export enum RowAnimationCssClasses {
    ANIMATION_ON = 'ag-row-animation',
    ANIMATION_OFF = 'ag-row-no-animation'
}

export interface GridBodyView extends  LayoutView {
    setProps(params: {enableRtl: boolean, printLayout: boolean}): void;
    setRowAnimationCssOnBodyViewport(animate: boolean): void;
}

export class GridBodyController extends BeanStub {

    @Autowired('maxDivHeightScaler') private heightScaler: MaxDivHeightScaler;

    private view: GridBodyView;

    // properties we use a lot, so keep reference
    private enableRtl: boolean;
    private printLayout: boolean;

    constructor(params: {view: GridBodyView}) {
        super();
        this.view = params.view;
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


}
