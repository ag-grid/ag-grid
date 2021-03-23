import { Component, elementGettingCreated } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import { RowContainerController, RowContainerView } from "./rowContainerController";
import {
    appendHtml,
    ensureDomOrder,
    getInnerWidth,
    getScrollLeft,
    insertTemplateWithDomOrder, isHorizontalScrollShowing,
    isVisible
} from "../../utils/dom";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { ResizeObserverService } from "../../misc/resizeObserverService";
import { ColumnController } from "../../columnController/columnController";
import { SetPinnedLeftWidthFeature } from "./setPinnedLeftWidthFeature";
import { SetPinnedRightWidthFeature } from "./setPinnedRightWidthFeature";

export enum RowContainerNames {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    FULL_WIDTH = 'fullWidth',

    TOP_LEFT = 'topLeft',
    TOP_RIGHT = 'topRight',
    TOP_CENTER = 'topCenter',
    TOP_FULL_WITH = 'topFullWidth',

    BOTTOM_LEFT = 'bottomLeft',
    BOTTOM_RIGHT = 'bottomRight',
    BOTTOM_CENTER = 'bottomCenter',
    BOTTOM_FULL_WITH = 'bottomFullWidth'
}

const ContainerCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-container'],
    [RowContainerNames.LEFT, 'ag-pinned-left-cols-container'],
    [RowContainerNames.RIGHT, 'ag-pinned-right-cols-container'],
    [RowContainerNames.FULL_WIDTH, 'ag-full-width-container'],

    [RowContainerNames.TOP_CENTER, 'ag-floating-top-container'],
    [RowContainerNames.TOP_LEFT, 'ag-pinned-left-floating-top'],
    [RowContainerNames.TOP_RIGHT, 'ag-pinned-right-floating-top'],
    [RowContainerNames.TOP_FULL_WITH, 'ag-floating-top-full-width-container'],

    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-container'],
    [RowContainerNames.BOTTOM_LEFT, 'ag-pinned-left-floating-bottom'],
    [RowContainerNames.BOTTOM_RIGHT, 'ag-pinned-right-floating-bottom'],
    [RowContainerNames.BOTTOM_FULL_WITH, 'ag-floating-bottom-full-width-container'],
]);

const ViewportCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-viewport'],
    [RowContainerNames.TOP_CENTER, 'ag-floating-top-viewport'],
    [RowContainerNames.BOTTOM_CENTER, 'ag-floating-bottom-viewport'],
]);

const WrapperCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-clipper'],
]);

function templateFactory(): string {
    const name = elementGettingCreated.getAttribute('name') as RowContainerNames;

    const containerClass = ContainerCssClasses.get(name);
    const viewportClass = ViewportCssClasses.get(name);
    const wrapperClass = WrapperCssClasses.get(name);

    let res: string;

    switch (name) {

        case RowContainerNames.LEFT :
        case RowContainerNames.RIGHT :
        case RowContainerNames.FULL_WIDTH :
        case RowContainerNames.TOP_LEFT :
        case RowContainerNames.TOP_RIGHT :
        case RowContainerNames.TOP_FULL_WITH :
        case RowContainerNames.BOTTOM_LEFT :
        case RowContainerNames.BOTTOM_RIGHT :
        case RowContainerNames.BOTTOM_FULL_WITH :
            res = /* html */
            `<div class="${containerClass}" ref="eContainer" role="presentation" unselectable="on"></div>`
            break;

        case RowContainerNames.CENTER :
            res =  /* html */
            `<div class="${wrapperClass}" ref="eWrapper" role="presentation" unselectable="on">
                <div class="${viewportClass}" ref="eViewport" role="presentation">
                    <div class="${containerClass}" ref="eContainer" role="rowgroup" unselectable="on"></div>
                </div>
            </div>`;
            break;

        case RowContainerNames.TOP_CENTER :
        case RowContainerNames.BOTTOM_CENTER :
            res = /* html */
            `<div class="${viewportClass}" ref="eViewport" role="presentation" unselectable="on">
                <div class="${containerClass}" ref="eContainer" role="presentation" unselectable="on"></div>
            </div>`
            break;

        default: return '';
    }

    return res;
}

export class RowContainerComp extends Component {

    @Autowired('resizeObserverService') private resizeObserverService: ResizeObserverService;
    @Autowired('columnController') private columnController: ColumnController;

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    @RefSelector('eWrapper') private eWrapper: HTMLElement;

    private readonly name: RowContainerNames;

    private enableRtl: boolean;

    private rowTemplatesToAdd: string[] = [];
    private afterGuiAttachedCallbacks: Function[] = [];

    private scrollTop: number;

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;

    constructor() {
        super(templateFactory());
        this.name = elementGettingCreated.getAttribute('name')! as RowContainerNames;
    }

    @PostConstruct
    private postConstruct(): void {

        this.enableRtl = this.gridOptionsWrapper.isEnableRtl();

        const view: RowContainerView = {
            setViewportHeight: height => this.eViewport.style.height = height,
        };

        this.createManagedBean(new RowContainerController(view, this.name));

        this.listenOnDomOrder();

        this.stopHScrollOnPinnedRows();

        this.forContainers([RowContainerNames.LEFT, RowContainerNames.BOTTOM_LEFT, RowContainerNames.TOP_LEFT],
            ()=> this.createManagedBean(new SetPinnedLeftWidthFeature(this.eContainer)))

        this.forContainers([RowContainerNames.RIGHT, RowContainerNames.BOTTOM_RIGHT, RowContainerNames.TOP_RIGHT],
            ()=> this.createManagedBean(new SetPinnedRightWidthFeature(this.eContainer)))
    }

    private forContainers(names: RowContainerNames[], callback: (()=>void)): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    public registerViewportResizeListener(listener: (()=>void) ) {
        const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eViewport, listener);
        this.addDestroyFunc(() => unsubscribeFromResize());
    }

    public isViewportHScrollShowing(): boolean {
        return isHorizontalScrollShowing(this.eViewport);
    }

    public getViewportScrollLeft(): number {
        return getScrollLeft(this.eViewport, this.enableRtl);
    }

    public isViewportVisible(): boolean {
        return isVisible(this.eViewport);
    }

    public getCenterWidth(): number {
        return getInnerWidth(this.eViewport);
    }

    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    private stopHScrollOnPinnedRows(): void {
        this.forContainers([RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER], ()=> {
            const resetScrollLeft = ()=> this.eViewport.scrollLeft = 0;
            this.addManagedListener(this.eViewport, 'scroll', resetScrollLeft);
        });
    }

    private listenOnDomOrder(): void {
        const listener = () => this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        listener();
    }

    public getViewportElement(): HTMLElement {
        return this.eViewport;
    }

    public getContainerElement(): HTMLElement {
        return this.eContainer;
    }

    public setVerticalScrollPosition(verticalScrollPosition: number): void {
        this.scrollTop = verticalScrollPosition;
    }

    public getRowElement(compId: number): HTMLElement {
        return this.eContainer.querySelector(`[comp-id="${compId}"]`) as HTMLElement;
    }

    public setHeight(height: number | null): void {
        const heightString = height != null ? `${height}px` : ``;

        this.eContainer.style.height = heightString;
        if (this.eWrapper) {
            this.eWrapper.style.height = heightString;
        }
    }

    public flushRowTemplates(): void {

        // if doing dom order, then rowTemplates will be empty,
        // or if no rows added since last time also empty.
        if (this.rowTemplatesToAdd.length !== 0) {
            const htmlToAdd = this.rowTemplatesToAdd.join('');
            appendHtml(this.eContainer, htmlToAdd);
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
            this.lastPlacedElement = insertTemplateWithDomOrder(this.eContainer, rowTemplate, this.lastPlacedElement);
        } else {
            this.rowTemplatesToAdd.push(rowTemplate);
        }

        this.afterGuiAttachedCallbacks.push(callback);
    }

    public ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }

    public removeRowElement(eRow: HTMLElement): void {
        this.eContainer.removeChild(eRow);
    }

}