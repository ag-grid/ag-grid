import { ColumnPinnedType } from '../../entities/column';
import { PostConstruct, PreDestroy } from '../../context/context';
import { ensureDomOrder } from '../../utils/dom';
import { getAllValuesInObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { HeaderRowComp } from '../row/headerRowComp';
import { HeaderRowCtrl } from '../row/headerRowCtrl';
import { HeaderRowContainerCtrl, IHeaderRowContainerComp } from './headerRowContainerCtrl';

export class HeaderRowContainerComp extends Component {

    private static PINNED_LEFT_TEMPLATE =  /* html */ `<div class="ag-pinned-left-header" role="presentation"></div>`;

    private static PINNED_RIGHT_TEMPLATE =  /* html */ `<div class="ag-pinned-right-header" role="presentation"></div>`;

    private static CENTER_TEMPLATE =  /* html */
        `<div class="ag-header-viewport" role="presentation">
            <div class="ag-header-container" ref="eCenterContainer" role="rowgroup"></div>
        </div>`;

    @RefSelector('eCenterContainer') private eCenterContainer: HTMLElement;

    private eRowContainer: HTMLElement;

    private pinned: ColumnPinnedType;

    private headerRowComps: {[ctrlId: string]: HeaderRowComp} = {};
    private rowCompsList: HeaderRowComp[] = [];

    constructor(pinned: ColumnPinnedType) {
        super();
        this.pinned = pinned;
    }

    @PostConstruct
    private init(): void {
        this.selectAndSetTemplate();

        const compProxy: IHeaderRowContainerComp = {
            setDisplayed: displayed => this.setDisplayed(displayed),
            setCtrls: ctrls => this.setCtrls(ctrls),

            // only gets called for center section
            setCenterWidth: width => this.eCenterContainer.style.width = width,
            setContainerTransform: transform => this.eCenterContainer.style.transform = transform,

            // only gets called for pinned sections
            setPinnedContainerWidth: width => {
                const eGui = this.getGui();
                eGui.style.width = width;
                eGui.style.maxWidth = width;
                eGui.style.minWidth = width;
            }
        };

        const ctrl = this.createManagedBean(new HeaderRowContainerCtrl(this.pinned));
        ctrl.setComp(compProxy, this.getGui());
    }

    private selectAndSetTemplate(): void {
        const pinnedLeft = this.pinned == 'left';
        const pinnedRight = this.pinned == 'right';

        const template = pinnedLeft ? HeaderRowContainerComp.PINNED_LEFT_TEMPLATE :
                         pinnedRight ? HeaderRowContainerComp.PINNED_RIGHT_TEMPLATE : HeaderRowContainerComp.CENTER_TEMPLATE;

        this.setTemplate(template);

        // for left and right, we add rows directly to the root element,
        // but for center container we add elements to the child container.
        this.eRowContainer = this.eCenterContainer ? this.eCenterContainer : this.getGui();
    }

    @PreDestroy
    private destroyRowComps(): void {
        this.setCtrls([]);
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
                ensureDomOrder(this.eRowContainer, eGui, prevGui);
            }

            prevGui = eGui;
        };

        ctrls.forEach(ctrl => {
            const ctrlId = ctrl.getInstanceId();
            const existingComp =  oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ? existingComp : this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;
            this.rowCompsList.push(rowComp);

            appendEnsuringDomOrder(rowComp);
        });

        getAllValuesInObject(oldRowComps).forEach(c => this.destroyRowComp(c));
    }
}
