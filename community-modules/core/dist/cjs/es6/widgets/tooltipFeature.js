/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const beanStub_1 = require("../context/beanStub");
const customTooltipFeature_1 = require("./customTooltipFeature");
class TooltipFeature extends beanStub_1.BeanStub {
    constructor(ctrl, beans) {
        super();
        this.ctrl = ctrl;
        this.beans = beans;
    }
    setComp(comp) {
        this.comp = comp;
        this.setupTooltip();
    }
    setupTooltip() {
        this.browserTooltips = this.beans.gridOptionsWrapper.isEnableBrowserTooltips();
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.comp.setTitle(this.tooltip != null ? this.tooltip : undefined);
        }
        else {
            this.createTooltipFeatureIfNeeded();
        }
    }
    updateTooltipText() {
        this.tooltip = this.ctrl.getTooltipValue();
    }
    createTooltipFeatureIfNeeded() {
        if (this.genericTooltipFeature != null) {
            return;
        }
        const parent = {
            getTooltipParams: () => this.getTooltipParams(),
            getGui: () => this.ctrl.getGui()
        };
        this.genericTooltipFeature = this.createManagedBean(new customTooltipFeature_1.CustomTooltipFeature(parent), this.beans.context);
    }
    refreshToolTip() {
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.comp.setTitle(this.tooltip != null ? this.tooltip : undefined);
        }
    }
    getTooltipParams() {
        const ctrl = this.ctrl;
        const column = ctrl.getColumn ? ctrl.getColumn() : undefined;
        const colDef = ctrl.getColDef ? ctrl.getColDef() : undefined;
        const rowNode = ctrl.getRowNode ? ctrl.getRowNode() : undefined;
        return {
            location: ctrl.getLocation(),
            colDef: colDef,
            column: column,
            rowIndex: ctrl.getRowIndex ? ctrl.getRowIndex() : undefined,
            node: rowNode,
            data: rowNode ? rowNode.data : undefined,
            value: this.getTooltipText(),
            valueFormatted: ctrl.getValueFormatted ? ctrl.getValueFormatted() : undefined,
        };
    }
    getTooltipText() {
        return this.tooltip;
    }
    // overriding to make public, as we don't dispose this bean via context
    destroy() {
        super.destroy();
    }
}
exports.TooltipFeature = TooltipFeature;
