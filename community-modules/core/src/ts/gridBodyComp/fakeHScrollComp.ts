import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHScrollCtrl, IFakeHScrollComp } from "./fakeHScrollCtrl";
import { setFixedHeight, setFixedWidth } from "../utils/dom";
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

    constructor() {
        super(FakeHScrollComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const compProxy: IFakeHScrollComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setHeight: height => setFixedHeight(this.getGui(), height),
            setBottom: bottom => this.getGui().style.bottom = `${bottom}px`,
            setContainerHeight: height => setFixedHeight(this.eContainer, height),
            setDisplayed: displayed => this.setDisplayed(displayed, { skipAriaHidden: true }),
            setViewportHeight: height => setFixedHeight(this.eViewport, height),
            setRightSpacerFixedWidth: width => setFixedWidth(this.eRightSpacer, width),
            setLeftSpacerFixedWidth: width => setFixedWidth(this.eLeftSpacer, width),
            includeLeftSpacerScrollerCss: (cssClass: string, include: boolean) =>
                this.eLeftSpacer.classList.toggle(cssClass, include),
            includeRightSpacerScrollerCss: (cssClass: string, include: boolean) =>
                this.eRightSpacer.classList.toggle(cssClass, include),
        };
        const ctrl = this.createManagedBean(new FakeHScrollCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.eViewport, this.eContainer);

        this.createManagedBean(new CenterWidthFeature(width => this.eContainer.style.width = `${width}px`));
    }

}