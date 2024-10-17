import type { ColumnPinnedType } from '../../interfaces/iColumn';
import { _ensureDomOrder } from '../../utils/dom';
import { Component, RefPlaceholder } from '../../widgets/component';
import { HeaderRowComp } from '../row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from '../row/headerRowCtrl';
import type { IHeaderRowContainerComp } from './headerRowContainerCtrl';
import { HeaderRowContainerCtrl } from './headerRowContainerCtrl';

const PINNED_LEFT_TEMPLATE = /* html */ `<div class="ag-pinned-left-header" role="rowgroup"></div>`;

const PINNED_RIGHT_TEMPLATE = /* html */ `<div class="ag-pinned-right-header" role="rowgroup"></div>`;

const CENTER_TEMPLATE = /* html */ `<div class="ag-header-viewport" role="presentation">
        <div class="ag-header-container" data-ref="eCenterContainer" role="rowgroup"></div>
    </div>`;

export class HeaderRowContainerComp extends Component {
    private eCenterContainer: HTMLElement = RefPlaceholder;

    private eRowContainer: HTMLElement;

    private pinned: ColumnPinnedType;

    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};
    private rowCompsList: HeaderRowComp[] = [];

    constructor(pinned: ColumnPinnedType) {
        super();
        this.pinned = pinned;
    }

    public postConstruct(): void {
        this.selectAndSetTemplate();

        const compProxy: IHeaderRowContainerComp = {
            setDisplayed: (displayed) => this.setDisplayed(displayed),
            setCtrls: (ctrls) => this.setCtrls(ctrls),

            // only gets called for center section
            setCenterWidth: (width) => (this.eCenterContainer.style.width = width),
            setViewportScrollLeft: (left) => (this.getGui().scrollLeft = left),

            // only gets called for pinned sections
            setPinnedContainerWidth: (width) => {
                const eGui = this.getGui();
                eGui.style.width = width;
                eGui.style.maxWidth = width;
                eGui.style.minWidth = width;
            },
        };

        const ctrl = this.createManagedBean(new HeaderRowContainerCtrl(this.pinned));
        ctrl.setComp(compProxy, this.getGui());
    }

    private selectAndSetTemplate(): void {
        const pinnedLeft = this.pinned == 'left';
        const pinnedRight = this.pinned == 'right';

        const template = pinnedLeft ? PINNED_LEFT_TEMPLATE : pinnedRight ? PINNED_RIGHT_TEMPLATE : CENTER_TEMPLATE;

        this.setTemplate(template);

        // for left and right, we add rows directly to the root element,
        // but for center container we add elements to the child container.
        this.eRowContainer = this.eCenterContainer !== RefPlaceholder ? this.eCenterContainer : this.getGui();
    }

    public override destroy(): void {
        this.setCtrls([]);
        super.destroy();
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        this.destroyBean(rowComp);
        this.eRowContainer.removeChild(rowComp.getGui());
    }

    private setCtrls(ctrls: HeaderRowCtrl[]): void {
        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};
        this.rowCompsList = [];

        let prevGui: HTMLElement;

        const appendEnsuringDomOrder = (rowComp: HeaderRowComp) => {
            const eGui = rowComp.getGui();

            const notAlreadyIn = eGui.parentElement != this.eRowContainer;
            if (notAlreadyIn) {
                this.eRowContainer.appendChild(eGui);
            }
            if (prevGui) {
                _ensureDomOrder(this.eRowContainer, eGui, prevGui);
            }

            prevGui = eGui;
        };

        ctrls.forEach((ctrl) => {
            const ctrlId = ctrl.instanceId;
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ? existingComp : this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;
            this.rowCompsList.push(rowComp);

            appendEnsuringDomOrder(rowComp);
        });

        Object.values(oldRowComps).forEach((c) => this.destroyRowComp(c));
    }
}
