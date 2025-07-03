import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { ElementParams } from '../../utils/dom';
import { _ensureDomOrder } from '../../utils/dom';
import { Component, RefPlaceholder } from '../../widgets/component';
import { HeaderRowComp } from '../row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from '../row/headerRowCtrl';
import type { IHeaderRowContainerComp } from './headerRowContainerCtrl';
import { HeaderRowContainerCtrl } from './headerRowContainerCtrl';

const PinnedLeftElement: ElementParams = { tag: 'div', cls: 'ag-pinned-left-header', role: 'rowgroup' };
const PinnedRightElement: ElementParams = { tag: 'div', cls: 'ag-pinned-right-header', role: 'rowgroup' };
const CenterElement: ElementParams = {
    tag: 'div',
    cls: 'ag-header-viewport',
    role: 'presentation',
    attrs: { tabindex: '-1' },
    children: [{ tag: 'div', ref: 'eCenterContainer', cls: 'ag-header-container', role: 'rowgroup' }],
};

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

        const template = pinnedLeft ? PinnedLeftElement : pinnedRight ? PinnedRightElement : CenterElement;

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
