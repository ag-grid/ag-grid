import {Utils as _} from "../utils";

export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;
    useDocumentFragment?: boolean;
}

/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export class RowContainerComponent {

    private eContainer: HTMLElement;
    private eDocumentFragment: DocumentFragment;
    private eViewport: HTMLElement;

    private hideWhenNoChildren: boolean;
    private childCount = 0;
    private visible: boolean;

    constructor(params: RowContainerComponentParams) {
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;

        if (params.useDocumentFragment) {
            this.setupDocumentFragment();
        }

        this.hideWhenNoChildren = params.hideWhenNoChildren;

        this.checkVisibility();
    }

    public setupDocumentFragment(): void {
        let browserSupportsDocumentFragment = !!document.createDocumentFragment;
        if (browserSupportsDocumentFragment) {
            this.eDocumentFragment = document.createDocumentFragment();
        }
    }

    public setHeight(height: number): void {
        this.eContainer.style.height = height + "px";
    }

    public appendRowElement(eRow: HTMLElement): void {
        var eTarget = this.eDocumentFragment ? this.eDocumentFragment : this.eContainer;
        eTarget.appendChild(eRow);
        this.childCount++;
        this.checkVisibility();
    }

    public removeRowElement(eRow: HTMLElement): void {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
    }

    public flushDocumentFragment(): void {
        if (_.exists(this.eDocumentFragment)) {
            // we prepend rather than append so that new rows appear under current rows. this way the new
            // rows are not over the current rows which will get animation as they slid to new position
            _.prependDC(this.eContainer, this.eDocumentFragment);
        }
    }

    private checkVisibility(): void {
        if (!this.hideWhenNoChildren) { return; }

        let eGui = this.eViewport ? this.eViewport : this.eContainer;
        let visible = this.childCount > 0;

        if (this.visible !== visible) {
            this.visible = visible;
            _.setVisible(eGui, visible);
        }

    }
}
