import {Utils as _} from "../utils";
import {Autowired, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    hideWhenNoChildren?: boolean;

    // this was put in for testing only. there is some code below that demonstrates the problem
    // with max div height solution
    body?: boolean;
}

/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export class RowContainerComponent {

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;

    // used for testing - for when we want to do something different in the body.
    // see code commented out in 'setHeight' method
    private body: boolean;

    // full width containers only show when no children, because they float above the normal rows,
    // it adds complexity that can be confusing when inspecting the dom when they are not needed.
    private hideWhenNoChildren: boolean;
    private childCount = 0;
    private visible: boolean;

    private rowTemplatesToAdd: string[] = [];
    private afterGuiAttachedCallbacks: Function[] = [];

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement;

    constructor(params: RowContainerComponentParams) {
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        this.hideWhenNoChildren = params.hideWhenNoChildren;
        this.body = params.body;
    }

    @PostConstruct
    private postConstruct(): void {
        this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder() && !this.gridOptionsWrapper.isForPrint();
        this.checkVisibility();
    }

    public getRowElement(compId: number): HTMLElement {
        return <HTMLElement> this.eContainer.querySelector(`[comp-id="${compId}"]`);
    }

    public setHeight(height: number): void {
        this.eContainer.style.height = height + "px";

        // can ask niall about this - was testing different ways to get the browser to display
        // unlimited number of rows

        // if (this.body) {
        //     let eParent = this.eViewport;
        //
        //     let FILLER_HEIGHT = 1000000;
        //
        //     let fillerCount = 0;
        //     let colors = ['#000020','#000040','#000060','#000080','#0000A0','#0000C0','#0000E0','#00F000','#00F020','#00F040','#00F060','#00F080','#00F0A0','#00F0C0','#00F0E0'];
        //     _.removeAllChildren(eParent);
        //     let pixelsToGo = height;
        //     while (pixelsToGo > 0) {
        //         fillerCount++;
        //         let pixelsThisDiv = (pixelsToGo > FILLER_HEIGHT) ? FILLER_HEIGHT : pixelsToGo;
        //         pixelsToGo -= FILLER_HEIGHT;
        //         let eFiller = document.createElement('div');
        //         eFiller.style.height = pixelsThisDiv + 'px';
        //         eFiller.style.backgroundColor = colors[fillerCount%colors.length];
        //         eFiller.innerHTML = '' + fillerCount;
        //         eParent.appendChild(eFiller);
        //     }
        //     console.log(`fillerCount = ${fillerCount}`);
        // }

    }

    public flushRowTemplates(): void {

        // if doing dom order, then rowTemplates will be empty,
        // or if no rows added since last time also empty.
        if (this.rowTemplatesToAdd.length!==0) {
            let htmlToAdd = this.rowTemplatesToAdd.join('');
            _.appendHtml(this.eContainer, htmlToAdd);
            this.rowTemplatesToAdd.length = 0;
        }

        // this only empty if no rows since last time, as when
        // doing dom order, we still have callbacks to process
        this.afterGuiAttachedCallbacks.forEach( func => func() );
        this.afterGuiAttachedCallbacks.length = 0;

        this.lastPlacedElement = null;
    }

    public appendRowTemplate(rowTemplate: string,
                             callback: ()=>void) {

        if (this.domOrder) {
            this.lastPlacedElement = _.insertTemplateWithDomOrder(this.eContainer, rowTemplate, this.lastPlacedElement);
        } else {
            this.rowTemplatesToAdd.push(rowTemplate);
        }

        this.afterGuiAttachedCallbacks.push(callback);

        // it is important we put items in in order, so that when we open a row group,
        // the new rows are inserted after the opened group, but before the rows below.
        // that way, the rows below are over the new rows (as dom renders last in dom over
        // items previous in dom), otherwise the child rows would cover the row below and
        // that meant the user doesn't see the rows below slide away.
        this.childCount++;
        this.checkVisibility();
    }

    public ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            _.ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }

    public removeRowElement(eRow: HTMLElement): void {
        this.eContainer.removeChild(eRow);
        this.childCount--;
        this.checkVisibility();
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
