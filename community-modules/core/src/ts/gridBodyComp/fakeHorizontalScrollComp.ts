import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
import { PostConstruct } from "../context/context";
import { FakeHorizontalScrollController, FakeHorizontalScrollView } from "./fakeHorizontalScrollController";
import { setFixedHeight } from "../utils/dom";

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
            setHeight: (height: number)=> setFixedHeight(this.getGui(), height),
            setContainerHeight: (height: number)=> setFixedHeight(this.eContainer, height),
            setViewportHeight: (height: number)=> setFixedHeight(this.eViewport, height),
        };
        this.controller = this.createManagedBean(new FakeHorizontalScrollController(view));
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public getRightSpacer(): HTMLElement {
        return this.eRightSpacer;
    }

    public getLeftSpacer(): HTMLElement {
        return this.eLeftSpacer;
    }

}