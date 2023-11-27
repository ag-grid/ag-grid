import { BeanStub } from "../context/beanStub.mjs";
import { CustomTooltipFeature } from "./customTooltipFeature.mjs";
export class TooltipFeature extends BeanStub {
    constructor(ctrl, beans) {
        super();
        this.ctrl = ctrl;
        this.beans = beans;
    }
    setComp(eGui) {
        this.eGui = eGui;
        this.setupTooltip();
    }
    setBrowserTooltip(tooltip) {
        const name = 'title';
        if (tooltip != null && tooltip != '') {
            this.eGui.setAttribute(name, tooltip);
        }
        else {
            this.eGui.removeAttribute(name);
        }
    }
    setupTooltip() {
        this.browserTooltips = this.beans.gridOptionsService.get('enableBrowserTooltips');
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
        }
        else {
            this.createTooltipFeatureIfNeeded();
        }
    }
    updateTooltipText() {
        this.tooltip = this.ctrl.getTooltipValue();
    }
    createTooltipFeatureIfNeeded() {
        var _a, _b, _c, _d;
        if (this.genericTooltipFeature != null) {
            return;
        }
        const parent = {
            getTooltipParams: () => this.getTooltipParams(),
            getGui: () => this.ctrl.getGui()
        };
        this.genericTooltipFeature = this.createManagedBean(new CustomTooltipFeature(parent, (_b = (_a = this.ctrl).getTooltipShowDelayOverride) === null || _b === void 0 ? void 0 : _b.call(_a), (_d = (_c = this.ctrl).getTooltipHideDelayOverride) === null || _d === void 0 ? void 0 : _d.call(_c)), this.beans.context);
    }
    refreshToolTip() {
        this.updateTooltipText();
        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
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
            hideTooltipCallback: () => this.genericTooltipFeature.hideTooltip(true)
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
