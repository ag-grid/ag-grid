import type { BeanCollection } from '../../context/context';
import { RowComp } from '../../rendering/row/rowComp';
import type { RowCtrl, RowCtrlInstanceId } from '../../rendering/row/rowCtrl';
import { _setAriaRole } from '../../utils/aria';
import { _ensureDomOrder, _insertWithDomOrder } from '../../utils/dom';
import { _getAllValuesInObject } from '../../utils/object';
import type { AgComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import type { IRowContainerComp, RowContainerType } from './rowContainerCtrl';
import { RowContainerCtrl, RowContainerName, getRowContainerTypeForName } from './rowContainerCtrl';

function templateFactory(): string {
    const name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;

    const cssClasses = RowContainerCtrl.getRowContainerCssClasses(name);

    let res: string;

    const centerTemplate =
        name === RowContainerName.CENTER ||
        name === RowContainerName.TOP_CENTER ||
        name === RowContainerName.STICKY_TOP_CENTER ||
        name === RowContainerName.BOTTOM_CENTER ||
        name === RowContainerName.STICKY_BOTTOM_CENTER;

    if (centerTemplate) {
        res =
            /* html */
            `<div class="${cssClasses.viewport}" ref="eViewport" role="presentation">
                <div class="${cssClasses.container}" ref="eContainer"></div>
            </div>`;
    } else {
        res = /* html */ `<div class="${cssClasses.container}" ref="eContainer"></div>`;
    }

    return res;
}

export class RowContainerComp extends Component {
    static readonly selector: AgComponentSelector = 'AG-ROW-CONTAINER';

    private beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.beans = beans;
    }

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;

    private readonly name: RowContainerName;
    private readonly type: RowContainerType;

    private rowComps: { [id: RowCtrlInstanceId]: RowComp } = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;

    constructor() {
        super(templateFactory());
        this.name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;
        this.type = getRowContainerTypeForName(this.name);
    }

    public postConstruct(): void {
        const compProxy: IRowContainerComp = {
            setViewportHeight: (height) => (this.eViewport.style.height = height),
            setRowCtrls: ({ rowCtrls }) => this.setRowCtrls(rowCtrls),
            setDomOrder: (domOrder) => {
                this.domOrder = domOrder;
            },
            setContainerWidth: (width) => (this.eContainer.style.width = width),
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, this.eContainer, this.eViewport);
    }

    public override destroy(): void {
        // destroys all row comps
        this.setRowCtrls([]);
        super.destroy();
    }

    private setRowCtrls(rowCtrls: RowCtrl[]): void {
        const oldRows = { ...this.rowComps };
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
                // don't create new row comps for rows which are not displayed. still want the existing components
                // as they may be animating out.
                if (!rowCon.getRowNode().displayed) {
                    return;
                }
                const rowComp = new RowComp(rowCon, this.beans, this.type);
                this.rowComps[instanceId] = rowComp;
                this.appendRow(rowComp.getGui());
            }
        };

        rowCtrls.forEach(processRow);
        _getAllValuesInObject(oldRows).forEach((oldRowComp) => {
            this.eContainer.removeChild(oldRowComp.getGui());
            oldRowComp.destroy();
        });

        _setAriaRole(this.eContainer, 'rowgroup');
    }

    public appendRow(element: HTMLElement) {
        if (this.domOrder) {
            _insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        } else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }

    private ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            _ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }
}
