import { Component, elementGettingCreated } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { PostConstruct } from "../../context/context";
import { RowContainerController, RowContainerView } from "./rowContainerController";
import { appendHtml, ensureDomOrder, insertTemplateWithDomOrder } from "../../utils/dom";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";

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

const ClipperCssClasses: Map<RowContainerNames, string> = new Map([
    [RowContainerNames.CENTER, 'ag-center-cols-clipper'],
]);

function templateFactory(): string {
    const name = elementGettingCreated.getAttribute('name') as RowContainerNames;

    const containerClass = ContainerCssClasses.get(name);
    const viewportClass = ViewportCssClasses.get(name);
    const clipperClass = ClipperCssClasses.get(name);

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
            `<div class="${containerClass}" role="presentation" unselectable="on" ref="eContainer"></div>`
            break;

        case RowContainerNames.CENTER :
            res =  /* html */
            `<div class="${clipperClass}" role="presentation" unselectable="on" ref="eColsClipper">
                <div class="${viewportClass}" ref="eViewport" role="presentation">
                    <div class="${containerClass}" ref="eContainer" role="rowgroup" unselectable="on"></div>
                </div>
            </div>`;
            break;

        case RowContainerNames.TOP_CENTER :
        case RowContainerNames.BOTTOM_CENTER :
            res = /* html */
            `<div class="${viewportClass}" role="presentation" unselectable="on" ref="eViewport">
                <div class="${containerClass}" ref="eContainer" role="presentation" unselectable="on"></div>
            </div>`
            break;

        default: return '';
    }

    return res;
}

export class RowContainerComp extends Component {


    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    @RefSelector('eColsClipper') private eColsClipper: HTMLElement;

    private name: string;

    private rowTemplatesToAdd: string[] = [];
    private afterGuiAttachedCallbacks: Function[] = [];

    private scrollTop: number;

    // this is to cater for a 'strange behaviour' where when a panel is made visible, it is firing a scroll
    // event which we want to ignore. see gridBodyComp.onAnyBodyScroll()
    private lastMadeVisibleTime = 0;

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;

    constructor() {
        super(templateFactory());
        this.name = elementGettingCreated.getAttribute('name')!;
    }

    @PostConstruct
    private postConstruct(): void {

        const view: RowContainerView = {
            setViewportHeight: height => this.eViewport.style.height = height,
        };

        this.createManagedBean(new RowContainerController(view, this.name));

        this.listenOnDomOrder();
    }

    private listenOnDomOrder(): void {
        const listener = () => this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        listener();
    }

    public getColsClipper(): HTMLElement {
        return this.eColsClipper;
    }

    public getViewport(): HTMLElement {
        return this.eViewport;
    }

    public getContainer(): HTMLElement {
        return this.eContainer;
    }

    public setVerticalScrollPosition(verticalScrollPosition: number): void {
        this.scrollTop = verticalScrollPosition;
    }

    public getRowElement(compId: number): HTMLElement {
        return this.eContainer.querySelector(`[comp-id="${compId}"]`) as HTMLElement;
    }

    public setHeight(height: number | null): void {
        if (height == null) {
            this.eContainer.style.height = '';
            return;
        }

        this.eContainer.style.height = `${height}px`;
        if (this.eColsClipper) {
            this.eColsClipper.style.height = `${height}px`;
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