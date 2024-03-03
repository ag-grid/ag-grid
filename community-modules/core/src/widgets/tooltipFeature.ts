import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { Beans } from "../rendering/beans";
import { CustomTooltipFeature, TooltipParentComp } from "./customTooltipFeature";
import { ITooltipParams, TooltipLocation } from "../rendering/tooltipComponent";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { WithoutGridCommon } from "../interfaces/iCommon";

export interface ITooltipFeatureCtrl {
    getTooltipValue(): any;
    getGui(): HTMLElement;
    getLocation(): TooltipLocation;

    getColumn?(): Column | ColumnGroup;
    getColDef?(): ColDef | ColGroupDef;
    getRowIndex?(): number;
    getRowNode?(): RowNode;

    // this makes no sense, why is the cell formatted value passed to the tooltip???
    getValueFormatted?(): string;
    getTooltipShowDelayOverride?(): number;
    getTooltipHideDelayOverride?(): number;
}

export class TooltipFeature extends BeanStub {

    private readonly ctrl: ITooltipFeatureCtrl;
    private readonly beans: Beans;

    private eGui: HTMLElement;

    private tooltip: any;

    private genericTooltipFeature: CustomTooltipFeature;
    private browserTooltips: boolean;

    constructor(ctrl: ITooltipFeatureCtrl, beans: Beans) {
        super();

        this.ctrl = ctrl;
        this.beans = beans;
    }

    public setComp(eGui: HTMLElement): void {
        this.eGui = eGui;
        this.setupTooltip();
    }

    private setBrowserTooltip(tooltip: string | null) {
        const name = 'title';
        if (tooltip != null && tooltip != '') {
            this.eGui.setAttribute(name, tooltip);
        } else {
            this.eGui.removeAttribute(name);
        }
    }

    private setupTooltip(): void {
        this.browserTooltips = this.beans.gridOptionsService.get('enableBrowserTooltips');
        this.updateTooltipText();

        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
        } else {
            this.createTooltipFeatureIfNeeded();
        }
    }

    private updateTooltipText(): void {
        this.tooltip = this.ctrl.getTooltipValue();
    }

    private createTooltipFeatureIfNeeded(): void {
        if (this.genericTooltipFeature != null) { return; }

        const parent: TooltipParentComp = {
            getTooltipParams: () => this.getTooltipParams(),
            getGui: () => this.ctrl.getGui()
        };

        this.genericTooltipFeature = this.createManagedBean(new CustomTooltipFeature(
            parent,
            this.ctrl.getTooltipShowDelayOverride?.(),
            this.ctrl.getTooltipHideDelayOverride?.()
        ), this.beans.context);
    }

    public refreshToolTip() {
        this.updateTooltipText();

        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
        }
    }

    public getTooltipParams(): WithoutGridCommon<ITooltipParams> {
        const ctrl = this.ctrl;
        const column = ctrl.getColumn ? ctrl.getColumn() : undefined;
        const colDef = ctrl.getColDef ? ctrl.getColDef() : undefined;
        const rowNode = ctrl.getRowNode ? ctrl.getRowNode() : undefined;

        return {
            location: ctrl.getLocation(), //'cell',
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

    private getTooltipText() {
        return this.tooltip;
    }

    // overriding to make public, as we don't dispose this bean via context
    public destroy() {
        super.destroy();
    }
}