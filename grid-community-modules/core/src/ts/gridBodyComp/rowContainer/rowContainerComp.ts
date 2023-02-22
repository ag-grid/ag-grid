import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct, PreDestroy } from "../../context/context";
import { getRowContainerTypeForName, IRowContainerComp, RowContainerCtrl, RowContainerName, RowContainerType } from "./rowContainerCtrl";
import { ensureDomOrder, insertWithDomOrder } from "../../utils/dom";
import { RowComp } from "../../rendering/row/rowComp";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { Beans } from "../../rendering/beans";
import { getAllValuesInObject } from "../../utils/object";
import { setAriaRole } from "../../utils/aria";

function templateFactory(): string {
    const name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;

    const cssClasses = RowContainerCtrl.getRowContainerCssClasses(name);

    let res: string;

    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER
                     || name === RowContainerName.STICKY_TOP_CENTER
                     || name === RowContainerName.BOTTOM_CENTER;

    if (template1) {
        res = /* html */
            `<div class="${cssClasses.wrapper}" ref="eWrapper" role="presentation">
                <div class="${cssClasses.viewport}" ref="eViewport" role="presentation">
                    <div class="${cssClasses.container}" ref="eContainer"></div>
                </div>
            </div>`;
    } else if (template2) {
        res = /* html */
            `<div class="${cssClasses.viewport}" ref="eViewport" role="presentation">
                <div class="${cssClasses.container}" ref="eContainer"></div>
            </div>`;
    } else {
        res = /* html */
            `<div class="${cssClasses.container}" ref="eContainer"></div>`;
    }

    return res;
}

export class RowContainerComp extends Component {

    @Autowired('beans') private beans: Beans;

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    @RefSelector('eWrapper') private eWrapper: HTMLElement;

    private readonly name: RowContainerName;
    private readonly type: RowContainerType;

    private rowComps: {[id: string]: RowComp} = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;

    constructor() {
        super(templateFactory());
        this.name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;
        this.type = getRowContainerTypeForName(this.name);
    }

    @PostConstruct
    private postConstruct(): void {
        const compProxy: IRowContainerComp = {
            setViewportHeight: height => this.eViewport.style.height = height,
            setRowCtrls: rowCtrls => this.setRowCtrls(rowCtrls),
            setDomOrder: domOrder => {
                this.domOrder = domOrder;
            },
            setContainerWidth: width => this.eContainer.style.width = width
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, this.eContainer, this.eViewport, this.eWrapper);
    }

    @PreDestroy
    private preDestroy(): void {
        // destroys all row comps
        this.setRowCtrls([]);
    }

    private setRowCtrls(rowCtrls: RowCtrl[]): void {
        const oldRows = {...this.rowComps};
        this.rowComps = {};

        this.lastPlacedElement = null;

        const processRow = (rowCon: RowCtrl) => {
            const instanceId = rowCon.getInstanceId();
            const existingRowComp = oldRows[instanceId];

            if (existingRowComp) {
                this.rowComps[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                this.ensureDomOrder(existingRowComp.getGui());
            } else {
                const rowComp = new RowComp(rowCon, this.beans, this.type);
                this.rowComps[instanceId] = rowComp;
                this.appendRow(rowComp.getGui());
            }
        };

        rowCtrls.forEach(processRow);
        getAllValuesInObject(oldRows).forEach(oldRowComp => {
            this.eContainer.removeChild(oldRowComp.getGui());
            oldRowComp.destroy();
        });

        setAriaRole(this.eContainer, rowCtrls.length ? "rowgroup" :  "presentation");
    }

    public appendRow(element: HTMLElement) {
        if (this.domOrder) {
            insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        } else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }

    private ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }

}