/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowContainerComp = void 0;
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const context_1 = require("../../context/context");
const rowContainerCtrl_1 = require("./rowContainerCtrl");
const dom_1 = require("../../utils/dom");
const rowComp_1 = require("../../rendering/row/rowComp");
const object_1 = require("../../utils/object");
const aria_1 = require("../../utils/aria");
function templateFactory() {
    const name = component_1.Component.elementGettingCreated.getAttribute('name');
    const cssClasses = rowContainerCtrl_1.RowContainerCtrl.getRowContainerCssClasses(name);
    let res;
    const template1 = name === rowContainerCtrl_1.RowContainerName.CENTER;
    const template2 = name === rowContainerCtrl_1.RowContainerName.TOP_CENTER
        || name === rowContainerCtrl_1.RowContainerName.STICKY_TOP_CENTER
        || name === rowContainerCtrl_1.RowContainerName.BOTTOM_CENTER;
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
class RowContainerComp extends component_1.Component {
    constructor() {
        super(templateFactory());
        this.rowComps = {};
        this.name = component_1.Component.elementGettingCreated.getAttribute('name');
        this.type = rowContainerCtrl_1.getRowContainerTypeForName(this.name);
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
        const ctrl = this.createManagedBean(new rowContainerCtrl_1.RowContainerCtrl(this.name));
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
                const rowComp = new rowComp_1.RowComp(rowCon, this.beans, this.type);
                this.rowComps[instanceId] = rowComp;
                this.appendRow(rowComp.getGui());
            }
        };
        rowCtrls.forEach(processRow);
        object_1.getAllValuesInObject(oldRows).forEach(oldRowComp => {
            this.eContainer.removeChild(oldRowComp.getGui());
            oldRowComp.destroy();
        });
        aria_1.setAriaRole(this.eContainer, rowCtrls.length ? "rowgroup" : "presentation");
    }
    appendRow(element) {
        if (this.domOrder) {
            dom_1.insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        }
        else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }
    ensureDomOrder(eRow) {
        if (this.domOrder) {
            dom_1.ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }
}
__decorate([
    context_1.Autowired('beans')
], RowContainerComp.prototype, "beans", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eViewport')
], RowContainerComp.prototype, "eViewport", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eContainer')
], RowContainerComp.prototype, "eContainer", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eWrapper')
], RowContainerComp.prototype, "eWrapper", void 0);
__decorate([
    context_1.PostConstruct
], RowContainerComp.prototype, "postConstruct", null);
__decorate([
    context_1.PreDestroy
], RowContainerComp.prototype, "preDestroy", null);
exports.RowContainerComp = RowContainerComp;
