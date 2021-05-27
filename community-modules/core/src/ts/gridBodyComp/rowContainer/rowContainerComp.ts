import { Component, elementGettingCreated } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import {
    ContainerCssClasses,
    RowContainerCtrl,
    RowContainerNames,
    IRowContainerComp,
    ViewportCssClasses,
    WrapperCssClasses
} from "./rowContainerCtrl";
import { ensureDomOrder, insertWithDomOrder } from "../../utils/dom";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { Events } from "../../eventKeys";
import { RowRenderer } from "../../rendering/rowRenderer";
import { RowComp } from "../../rendering/row/rowComp";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { Beans } from "../../rendering/beans";
import { Constants } from "../../constants/constants";
import { getAllValuesInObject } from "../../utils/object";

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
            `<div class="${containerClass}" ref="eContainer" role="presentation" unselectable="on"></div>`;
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
            </div>`;
            break;

        default: return '';
    }

    return res;
}

export class RowContainerComp extends Component {
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired("beans") private beans: Beans;

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    @RefSelector('eWrapper') private eWrapper: HTMLElement;

    private readonly name: RowContainerNames;

    private renderedRows: {[id: string]: RowComp} = {};
    private embedFullWidthRows: boolean;

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
        this.embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();

        const compProxy: IRowContainerComp = {
            setViewportHeight: height => this.eViewport.style.height = height,
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, this.eContainer, this.eViewport, this.eWrapper);

        this.listenOnDomOrder();

        this.stopHScrollOnPinnedRows();

        this.addManagedListener(this.eventService, Events.EVENT_DISPLAYED_ROWS_CHANGED, this.onDisplayedRowsChanged.bind(this));
    }

    private forContainers(names: RowContainerNames[], callback: (() => void)): void {
        if (names.indexOf(this.name) >= 0) {
            callback();
        }
    }

    // when editing a pinned row, if the cell is half outside the scrollable area, the browser can
    // scroll the column into view. we do not want this, the pinned sections should never scroll.
    // so we listen to scrolls on these containers and reset the scroll if we find one.
    private stopHScrollOnPinnedRows(): void {
        this.forContainers([RowContainerNames.TOP_CENTER, RowContainerNames.BOTTOM_CENTER], () => {
            const resetScrollLeft = () => this.eViewport.scrollLeft = 0;
            this.addManagedListener(this.eViewport, 'scroll', resetScrollLeft);
        });
    }

    private listenOnDomOrder(): void {
        const listener = () => this.domOrder = this.gridOptionsWrapper.isEnsureDomOrder();
        this.gridOptionsWrapper.addEventListener(GridOptionsWrapper.PROP_DOM_LAYOUT, listener);
        listener();
    }

    // this is repeated inside the controller, need to remove where this one is called from
    public getViewportElement(): HTMLElement {
        return this.eViewport;
    }

    public clearLastPlacedElement(): void {
        this.lastPlacedElement = null;
    }

    public appendRow(element: HTMLElement) {
        if (this.domOrder) {
            insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        } else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }

    public ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }

    public removeRow(eRow: HTMLElement): void {
        this.eContainer.removeChild(eRow);
    }

    private onDisplayedRowsChanged(): void {
        const fullWithContainer =
            this.name === RowContainerNames.TOP_FULL_WITH
            || this.name === RowContainerNames.BOTTOM_FULL_WITH
            || this.name === RowContainerNames.FULL_WIDTH;

        const oldRows = {...this.renderedRows};
        this.renderedRows = {};

        this.clearLastPlacedElement();

        const processRow = (rowCon: RowCtrl) => {
            const instanceId = rowCon.getInstanceId();
            const existingRowComp = oldRows[instanceId];
            if (existingRowComp) {
                this.renderedRows[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                this.ensureDomOrder(existingRowComp.getGui());
            } else {
                const rowComp = this.newRowComp(rowCon);
                this.renderedRows[instanceId] = rowComp;
                this.appendRow(rowComp.getGui());
            }
        };

        const doesRowMatch = (rowCon: RowCtrl) => {
            const fullWidthController = rowCon.isFullWidth();

            const printLayout = this.gridOptionsWrapper.getDomLayout() === Constants.DOM_LAYOUT_PRINT;

            const embedFW = this.embedFullWidthRows || printLayout;

            const match = fullWithContainer ?
                !embedFW && fullWidthController
                : embedFW || !fullWidthController;

            return match;
        };

        const rowConsToRender = this.getRowCons();

        rowConsToRender.filter(doesRowMatch).forEach(processRow);

        getAllValuesInObject(oldRows).forEach(rowComp => this.removeRow(rowComp.getGui()));
    }

    private getRowCons(): RowCtrl[] {
        switch (this.name) {
            case RowContainerNames.TOP_CENTER:
            case RowContainerNames.TOP_LEFT:
            case RowContainerNames.TOP_RIGHT:
            case RowContainerNames.TOP_FULL_WITH:
                return this.rowRenderer.getTopRowCons();

            case RowContainerNames.BOTTOM_CENTER:
            case RowContainerNames.BOTTOM_LEFT:
            case RowContainerNames.BOTTOM_RIGHT:
            case RowContainerNames.BOTTOM_FULL_WITH:
                return this.rowRenderer.getBottomRowCons();

            default:
                return this.rowRenderer.getRowCons();
        }
    }

    private newRowComp(rowCon: RowCtrl): RowComp {
        let pinned: string | null;
        switch (this.name) {
            case RowContainerNames.BOTTOM_LEFT:
            case RowContainerNames.TOP_LEFT:
            case RowContainerNames.LEFT:
                pinned = Constants.PINNED_LEFT;
                break;
            case RowContainerNames.BOTTOM_RIGHT:
            case RowContainerNames.TOP_RIGHT:
            case RowContainerNames.RIGHT:
                pinned = Constants.PINNED_RIGHT;
                break;
            default:
                pinned = null;
                break;
        }
        const res = new RowComp(rowCon, this, this.beans, pinned);
        return res;
    }

}