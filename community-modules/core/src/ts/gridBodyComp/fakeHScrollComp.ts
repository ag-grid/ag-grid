import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHScrollCtrl, IFakeHScrollComp } from "./fakeHScrollCtrl";
import { addOrRemoveCssClass, setFixedHeight, setFixedWidth } from "../utils/dom";
import { CenterWidthFeature } from "./centerWidthFeature";

export class FakeHScrollComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;

    // fake horizontal scroller
    @RefSelector('eLeftSpacer') private eLeftSpacer: HTMLElement;
    @RefSelector('eRightSpacer') private eRightSpacer: HTMLElement;
    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    private controller: FakeHScrollCtrl;

    constructor() {
        super(FakeHScrollComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const compProxy: IFakeHScrollComp = {
            setHeight: height => setFixedHeight(this.getGui(), height),
            setContainerHeight: height => setFixedHeight(this.eContainer, height),
            setViewportHeight: height => setFixedHeight(this.eViewport, height),
            setRightSpacerFixedWidth: width => setFixedWidth(this.eRightSpacer, width),
            setLeftSpacerFixedWidth: width => setFixedWidth(this.eLeftSpacer, width),
            setInvisibleStyles: (isInvisible) => addOrRemoveCssClass(this.getGui(), 'ag-scrollbar-invisible', isInvisible),
            setScrollingStyle: (isScrolling) => addOrRemoveCssClass(this.getGui(), 'ag-scrollbar-scrolling', isScrolling),
            addActiveListenerToggles: () => this.addActiveListenerToggles(),
            includeLeftSpacerScrollerCss: (cssClass: string, include: boolean) =>
                addOrRemoveCssClass(this.eLeftSpacer, cssClass, include),
            includeRightSpacerScrollerCss: (cssClass: string, include: boolean) =>
                addOrRemoveCssClass(this.eRightSpacer, cssClass, include),
        };
        this.controller = this.createManagedBean(new FakeHScrollCtrl());
        this.controller.setComp(compProxy, this.eViewport, this.eContainer);

        this.createManagedBean(new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }

    addActiveListenerToggles(): void {
        const eGui = this.getGui();
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'mouseup', 'touchend'];

        activateEvents.forEach(event => this.addManagedListener(eGui, event, () => addOrRemoveCssClass(eGui, 'ag-scrollbar-active', true)));
        deactivateEvents.forEach(event => this.addManagedListener(eGui, event, () => addOrRemoveCssClass(eGui, 'ag-scrollbar-active', false)));
    }
}