import {Utils as _} from "../utils";
import {Autowired, PostConstruct} from "../context/context";
import {GridOptionsWrapper} from "../gridOptionsWrapper";

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

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;

    private hideWhenNoChildren: boolean;
    private childCount = 0;
    private visible: boolean;

    private rowTemplatesToAdd: string[] = [];
    private afterGuiAttachedCallbacks: Function[] = [];

    private domOrder: boolean;
    private lastPlacedElement: HTMLElement;

    constructor(params: RowContainerComponentParams) {
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        this.hideWhenNoChildren = params.hideWhenNoChildren;
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
    }

    public flushRowTemplates(): void {

        // if doing dom order, then rowTemplates will be empty,
        // or if now rows added since last time also empty.
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
