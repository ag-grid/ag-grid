import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHorizontalScrollController, FakeHorizontalScrollView } from "./fakeHorizontalScrollController";
import { addOrRemoveCssClass, setFixedHeight, setFixedWidth } from "../utils/dom";
import { CenterWidthFeature } from "./centerWidthFeature";

export class FakeHorizontalScrollComp extends Component {

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

    private controller: FakeHorizontalScrollController;

    constructor() {
        super(FakeHorizontalScrollComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {
        const view: FakeHorizontalScrollView = {
            setHeight: height => setFixedHeight(this.getGui(), height),
            setContainerHeight: height => setFixedHeight(this.eContainer, height),
            setViewportHeight: height => setFixedHeight(this.eViewport, height),
            setRightSpacerFixedWidth: width => setFixedWidth(this.eRightSpacer, width),
            setLeftSpacerFixedWidth: width => setFixedWidth(this.eLeftSpacer, width),
            includeLeftSpacerScrollerCss: (cssClass: string, include: boolean) =>
                addOrRemoveCssClass(this.eLeftSpacer, cssClass, include),
            includeRightSpacerScrollerCss: (cssClass: string, include: boolean) =>
                addOrRemoveCssClass(this.eRightSpacer, cssClass, include),
        };
        this.controller = this.createManagedBean(new FakeHorizontalScrollController(view));

        this.createManagedBean(new CenterWidthFeature( width => this.eContainer.style.width = `${width}px`));
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

}