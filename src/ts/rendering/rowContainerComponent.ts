import {Utils as _} from "../utils";
import {RowNode} from "../entities/rowNode";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Autowired} from "../context/context";
import {RowComp} from "./rowComp";

export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;
}

/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export class RowContainerComponent {

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;

    private hideWhenNoChildren: boolean;
    private childCount = 0;
    private visible: boolean;

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    constructor(params: RowContainerComponentParams) {
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;

        this.hideWhenNoChildren = params.hideWhenNoChildren;

        this.checkVisibility();
    }

    public setHeight(height: number): void {
        this.eContainer.style.height = height + "px";
    }

    public appendRowElement_old(eRow: HTMLElement, eRowBefore: HTMLElement): void {
        this.eContainer.appendChild(eRow);
        this.childCount++;
        this.checkVisibility();
    }

    public appendRowElement(eRow: HTMLElement, eRowBefore: HTMLElement): void {
        if (eRowBefore) {
            if (eRowBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                this.eContainer.insertBefore(eRow, eRowBefore.nextSibling);
            } else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                this.eContainer.appendChild(eRow);
            }
        } else {
            if (this.eContainer.firstChild) {
                // insert it at the first location
                this.eContainer.insertBefore(eRow, this.eContainer.firstChild);
            } else {
                // otherwise eContainer is empty, so just append it
                this.eContainer.appendChild(eRow);
            }
        }
        this.childCount++;
        this.checkVisibility();
    }

    public ensureDomOrder_old(eRow: HTMLElement, eRowBefore: HTMLElement): void {

    }

    public ensureDomOrder(eRow: HTMLElement, eRowBefore: HTMLElement): void {
        // if already in right order, do nothing
        if (eRowBefore && eRowBefore.nextSibling === eRow) { return; }

        if (eRowBefore) {
            if (eRowBefore.nextSibling) {
                // insert between the eRowBefore and the row after it
                this.eContainer.insertBefore(eRow, eRowBefore.nextSibling);
            } else {
                // if nextSibling is missing, means other row is at end, so just append new row at the end
                this.eContainer.appendChild(eRow);
            }
        } else {
            // otherwise put at start
            if (this.eContainer.firstChild) {
                // insert it at the first location
                this.eContainer.insertBefore(eRow, this.eContainer.firstChild);
            }
        }
    }

    public removeRowElement(eRow: HTMLElement): void {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
    }

    // WARNING - this method is very hard on the DOM, the shuffles the DOM rows even if they don't need
    // shuffling, hence a huge performance hit. really the order should be worked out as the rows are getting
    // inserted (which is not possible when using the Document Fragment) - so we should do this right (insert
    // at correct index) and not use Document Fragment when this is the case).
    public sortDomByRowNodeIndex(): void {
        // if a cell is focused, it will loose focus after this rearrange
        let originalFocusedElement: HTMLElement = <HTMLElement> document.activeElement;

        let eChildren: HTMLElement[] = [];
        for (let i = 0; i<this.eContainer.children.length; i++) {
            let eChild = <HTMLElement>this.eContainer.children[i];
            // we only include elements that have attached rowComps - when the grid removes rows
            // from the grid, the rowComp gets detached form the element
            let rowComp = this.gridOptionsWrapper.getDomData(eChild, RowComp.DOM_DATA_KEY_RENDERED_ROW);
            if (rowComp) {
                eChildren.push(eChild);
            }
        }
        eChildren.sort( (a: HTMLElement, b: HTMLElement): number => {
            let rowCompA: RowComp = this.gridOptionsWrapper.getDomData(a, RowComp.DOM_DATA_KEY_RENDERED_ROW);
            let rowCompB: RowComp = this.gridOptionsWrapper.getDomData(b, RowComp.DOM_DATA_KEY_RENDERED_ROW);
            return rowCompA.getRowNode().rowIndex - rowCompB.getRowNode().rowIndex;
        });
        // we assume the last one is in place, then go through each element
        // and place it before the one after
        for (let i = eChildren.length - 2; i>=0; i--) {
            let eCurrent = eChildren[i];
            let eNext = eChildren[i+1];
            this.eContainer.insertBefore(eCurrent, eNext);
        }

        // if focus was lost, reset it. if the focus was not a cell,
        // then the focus would not of gotten impacted.
        if (originalFocusedElement !== document.activeElement) {
            originalFocusedElement.focus();
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
