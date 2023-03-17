/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct, PreDestroy } from "../../context/context";
import { getRowContainerTypeForName, RowContainerCtrl, RowContainerName } from "./rowContainerCtrl";
import { ensureDomOrder, insertWithDomOrder } from "../../utils/dom";
import { RowComp } from "../../rendering/row/rowComp";
import { getAllValuesInObject } from "../../utils/object";
import { setAriaRole } from "../../utils/aria";
function templateFactory() {
    const name = Component.elementGettingCreated.getAttribute('name');
    const cssClasses = RowContainerCtrl.getRowContainerCssClasses(name);
    let res;
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
    }
    else if (template2) {
        res = /* html */
            `<div class="${cssClasses.viewport}" ref="eViewport" role="presentation">
                <div class="${cssClasses.container}" ref="eContainer"></div>
            </div>`;
    }
    else {
        res = /* html */
            `<div class="${cssClasses.container}" ref="eContainer"></div>`;
    }
    return res;
}
export class RowContainerComp extends Component {
    constructor() {
        super(templateFactory());
        this.rowComps = {};
        this.name = Component.elementGettingCreated.getAttribute('name');
        this.type = getRowContainerTypeForName(this.name);
    }
    postConstruct() {
        const compProxy = {
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
    preDestroy() {
        // destroys all row comps
        this.setRowCtrls([]);
    }
    setRowCtrls(rowCtrls) {
        const oldRows = Object.assign({}, this.rowComps);
        this.rowComps = {};
        this.lastPlacedElement = null;
        const processRow = (rowCon) => {
            const instanceId = rowCon.getInstanceId();
            const existingRowComp = oldRows[instanceId];
            if (existingRowComp) {
                this.rowComps[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                this.ensureDomOrder(existingRowComp.getGui());
            }
            else {
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
        setAriaRole(this.eContainer, rowCtrls.length ? "rowgroup" : "presentation");
    }
    appendRow(element) {
        if (this.domOrder) {
            insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        }
        else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }
    ensureDomOrder(eRow) {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }
}
__decorate([
    Autowired('beans')
], RowContainerComp.prototype, "beans", void 0);
__decorate([
    RefSelector('eViewport')
], RowContainerComp.prototype, "eViewport", void 0);
__decorate([
    RefSelector('eContainer')
], RowContainerComp.prototype, "eContainer", void 0);
__decorate([
    RefSelector('eWrapper')
], RowContainerComp.prototype, "eWrapper", void 0);
__decorate([
    PostConstruct
], RowContainerComp.prototype, "postConstruct", null);
__decorate([
    PreDestroy
], RowContainerComp.prototype, "preDestroy", null);
