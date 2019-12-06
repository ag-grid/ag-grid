import { Autowired, PostConstruct } from "../context/context";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { _ } from "../utils";

export interface RowContainerComponentParams {
    eContainer: HTMLElement;
    eViewport?: HTMLElement;
    eWrapper?: HTMLElement;
    hideWhenNoChildren?: boolean;
}

/**
 * There are many instances of this component covering each of the areas a row can be entered
 * eg body, pinned left, fullWidth. The component differs from others in that it's given the
 * elements, there is no template. All of the elements are part of the GridPanel.
 */
export class RowContainerComponent {

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    private readonly eContainer: HTMLElement;
    private readonly eViewport: HTMLElement;
    private readonly eWrapper: HTMLElement;

    // full width containers only show when no children, because they float above the normal rows,
    // it adds complexity that can be confusing when inspecting the dom when they are not needed.
    private readonly hideWhenNoChildren: boolean;
    private childCount = 0;
    private visible: boolean;

    private rowTemplatesToAdd: string[] = [];
    private afterGuiAttachedCallbacks: Function[] = [];

    private scrollTop: number;

    // this is to cater for a 'strange behaviour' where when a panel is made visible, it is firing a scroll
    // event which we want to ignore. see gridPanel.onAnyBodyScroll()
    private lastMadeVisibleTime = 0;

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement;

    constructor(params: RowContainerComponentParams) {
        this.eContainer = params.eContainer;
        this.eViewport = params.eViewport;
        if (params.eWrapper) {
            this.eWrapper = params.eWrapper;
        }
        this.hideWhenNoChildren = params.hideWhenNoChildren;
    }

    public setVerticalScrollPosition(verticalScrollPosition: number): void {
        this.scrollTop = verticalScrollPosition;
    }

    @PostConstruct
    private postConstruct(): void {
        this.checkDomOrder();
        this.checkVisibility();
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, this.checkDomOrder.bind(this));
    }

    private checkDomOrder(): void {
        this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder();
    }

    public getRowElement(compId: number): HTMLElement {
        return this.eContainer.querySelector(`[comp-id="${compId}"]`) as HTMLElement;
    }

    public setHeight(height: number): void {
        if (height == null) {
            this.eContainer.style.height = '';
            return;
        }

        this.eContainer.style.height = `${height}px`;
        if (this.eWrapper) {
             this.eWrapper.style.height = `${height}px`;
        }
    }

    public flushRowTemplates(): void {

        // if doing dom order, then rowTemplates will be empty,
        // or if no rows added since last time also empty.
        if (this.rowTemplatesToAdd.length !== 0) {
            const htmlToAdd = this.rowTemplatesToAdd.join('');
            _.appendHtml(this.eContainer, htmlToAdd);
            this.rowTemplatesToAdd.length = 0;
        }

        // this only empty if no rows since last time, as when
        // doing dom order, we still have callbacks to process
        this.afterGuiAttachedCallbacks.forEach(func => func());
        this.afterGuiAttachedCallbacks.length = 0;

        this.lastPlacedElement = null;
    }

    public appendRowTemplate(rowTemplate: string,
                             callback: () => void) {

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

        const eGui = this.eViewport ? this.eViewport : this.eContainer;
        const visible = this.childCount > 0;

        if (this.visible !== visible) {
            this.visible = visible;
            this.lastMadeVisibleTime = new Date().getTime();

            _.setDisplayed(eGui, visible);
            // if we are showing the viewport, then the scroll is always zero,
            // so we need to align with the other sections (ie if this is full
            // width container, and first time showing a full width row, we need to
            // scroll it so full width rows are show in right place alongside the
            // body rows). without this, there was an issue with 'loading rows' for
            // server side row model, as loading rows are full width, and they were
            // not getting displayed in the right location when rows were expanded.
            if (visible && this.eViewport) {
                this.eViewport.scrollTop = this.scrollTop;
            }
        }
    }

    public isMadeVisibleRecently(): boolean {
        const now = new Date().getTime();
        const millisSinceVisible = now - this.lastMadeVisibleTime;
        return millisSinceVisible < 500;
    }
}
