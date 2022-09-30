/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Constants } from '../../constants/constants';
import { PostConstruct, PreDestroy } from '../../context/context';
import { ensureDomOrder } from '../../utils/dom';
import { getAllValuesInObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { RefSelector } from '../../widgets/componentAnnotations';
import { HeaderRowComp } from '../row/headerRowComp';
import { HeaderRowContainerCtrl } from './headerRowContainerCtrl';
export class HeaderRowContainerComp extends Component {
    constructor(pinned) {
        super();
        this.headerRowComps = {};
        this.rowCompsList = [];
        this.pinned = pinned;
    }
    init() {
        this.selectAndSetTemplate();
        const compProxy = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
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
    selectAndSetTemplate() {
        const pinnedLeft = this.pinned == Constants.PINNED_LEFT;
        const pinnedRight = this.pinned == Constants.PINNED_RIGHT;
        const template = pinnedLeft ? HeaderRowContainerComp.PINNED_LEFT_TEMPLATE :
            pinnedRight ? HeaderRowContainerComp.PINNED_RIGHT_TEMPLATE : HeaderRowContainerComp.CENTER_TEMPLATE;
        this.setTemplate(template);
        // for left and right, we add rows directly to the root element,
        // but for center container we add elements to the child container.
        this.eRowContainer = this.eCenterContainer ? this.eCenterContainer : this.getGui();
    }
    destroyRowComps() {
        this.setCtrls([]);
    }
    destroyRowComp(rowComp) {
        this.destroyBean(rowComp);
        this.eRowContainer.removeChild(rowComp.getGui());
    }
    setCtrls(ctrls) {
        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};
        this.rowCompsList = [];
        let prevGui;
        const appendEnsuringDomOrder = (rowComp) => {
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
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];
            const rowComp = existingComp ? existingComp : this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;
            this.rowCompsList.push(rowComp);
            appendEnsuringDomOrder(rowComp);
        });
        getAllValuesInObject(oldRowComps).forEach(c => this.destroyRowComp(c));
    }
}
HeaderRowContainerComp.PINNED_LEFT_TEMPLATE = `<div class="ag-pinned-left-header" role="presentation"/>`;
HeaderRowContainerComp.PINNED_RIGHT_TEMPLATE = `<div class="ag-pinned-right-header" role="presentation"/>`;
HeaderRowContainerComp.CENTER_TEMPLATE = `<div class="ag-header-viewport" role="presentation">
            <div class="ag-header-container" ref="eCenterContainer" role="rowgroup"></div>
        </div>`;
__decorate([
    RefSelector('eCenterContainer')
], HeaderRowContainerComp.prototype, "eCenterContainer", void 0);
__decorate([
    PostConstruct
], HeaderRowContainerComp.prototype, "init", null);
__decorate([
    PreDestroy
], HeaderRowContainerComp.prototype, "destroyRowComps", null);
