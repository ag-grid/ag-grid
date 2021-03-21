import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";

export class FakeHorizontalScroll extends Component {

    // fake horizontal scroller
    @RefSelector('eLeftSpacer') private eLeftSpacer: HTMLElement;
    @RefSelector('eRightSpacer') private eRightSpacer: HTMLElement;
    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    private static TEMPLATE = /* html */
        `<div class="ag-body-horizontal-scroll" aria-hidden="true">
            <div class="ag-horizontal-left-spacer" ref="eLeftSpacer"></div>
            <div class="ag-body-horizontal-scroll-viewport" ref="eViewport">
                <div class="ag-body-horizontal-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-horizontal-right-spacer" ref="eRightSpacer"></div>
        </div>`;

    constructor() {
        super(FakeHorizontalScroll.TEMPLATE);
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