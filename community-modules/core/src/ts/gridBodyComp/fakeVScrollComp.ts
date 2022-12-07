
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";

export class FakeHScrollComp extends Component {

    @RefSelector('eTopSpacer') private eTopSpacer: HTMLElement;
    @RefSelector('eBottomSpacer') private eBottomSpacer: HTMLElement;
    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    private static TEMPLATE = /* html */
        `<div class="ag-body-vertical-scroll" aria-hidden="true">
            <div class="ag-vertical-top-spacer" ref="eTopSpacer"></div>
            <div class="ag-body-vertical-scroll-viewport" ref="eViewport">
                <div class="ag-body-vertical-scroll-container" ref="eContainer"></div>
            </div>
            <div class="ag-vertical-bottom-spacer" ref="eBottomSpacer"></div>
        </div>`;

        
}