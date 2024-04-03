import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { TooltipStateManager, TooltipParentComp } from "./tooltipStateManager";
import { ITooltipParams, TooltipLocation } from "../rendering/tooltipComponent";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { Beans } from "../rendering/beans";
import { Autowired, PostConstruct } from "../context/context";

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
    shouldDisplayTooltip?(): boolean;
}

export class TooltipFeature extends BeanStub {

    private tooltip: any;

    private tooltipManager: TooltipStateManager | undefined;
    private browserTooltips: boolean;

    @Autowired('beans') private beans: Beans;

    constructor(private readonly ctrl: ITooltipFeatureCtrl, beans?: Beans) {
        super();

        if (beans) {
            this.beans = beans;
        }
    }

    @PostConstruct
    private postConstruct() {
        this.refreshToolTip();
    }


    private setBrowserTooltip(tooltip: string | null) {
        const name = 'title';
        const eGui = this.ctrl.getGui();

        if (!eGui) { return; }

        if (tooltip != null && tooltip != '') {
            eGui.setAttribute(name, tooltip);
        } else {
            eGui.removeAttribute(name);
        }
    }

    private updateTooltipText(): void {
        this.tooltip = this.ctrl.getTooltipValue();
    }

    private createTooltipFeatureIfNeeded(): void {
        if (this.tooltipManager != null) { return; }

        const parent: TooltipParentComp = {
            getTooltipParams: () => this.getTooltipParams(),
            getGui: () => this.ctrl.getGui()
        };

        this.tooltipManager = this.createBean(new TooltipStateManager(
            parent,
            this.ctrl.getTooltipShowDelayOverride?.(),
            this.ctrl.getTooltipHideDelayOverride?.(),
            this.ctrl.shouldDisplayTooltip
        ), this.beans.context);
    }

    public refreshToolTip() {
        this.browserTooltips = this.beans.gos.get('enableBrowserTooltips');
        this.updateTooltipText();

        if (this.browserTooltips) {
            this.setBrowserTooltip(this.tooltip);
            if (this.tooltipManager) {
                this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
            }
        } else {
            this.setBrowserTooltip(null);
            this.createTooltipFeatureIfNeeded();
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
            hideTooltipCallback: () => this.tooltipManager?.hideTooltip(true)
        };

    }

    private getTooltipText() {
        return this.tooltip;
    }

    // overriding to make public, as we don't dispose this bean via context
    public destroy() {
        if (this.tooltipManager) {
            this.tooltipManager = this.destroyBean(this.tooltipManager, this.beans.context);
        }
        super.destroy();
    }
}