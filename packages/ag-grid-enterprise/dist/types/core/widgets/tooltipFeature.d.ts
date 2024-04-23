import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { ITooltipParams, TooltipLocation } from "../rendering/tooltipComponent";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { WithoutGridCommon } from "../interfaces/iCommon";
import { Beans } from "../rendering/beans";
export interface ITooltipFeatureCtrl {
    getTooltipValue(): any;
    getGui(): HTMLElement;
    getLocation(): TooltipLocation;
    getColumn?(): Column | ColumnGroup;
    getColDef?(): ColDef | ColGroupDef;
    getRowIndex?(): number;
    getRowNode?(): RowNode;
    getValueFormatted?(): string;
    getTooltipShowDelayOverride?(): number;
    getTooltipHideDelayOverride?(): number;
    shouldDisplayTooltip?(): boolean;
}
export declare class TooltipFeature extends BeanStub {
    private readonly ctrl;
    private tooltip;
    private tooltipManager;
    private browserTooltips;
    private beans;
    constructor(ctrl: ITooltipFeatureCtrl, beans?: Beans);
    private postConstruct;
    private setBrowserTooltip;
    private updateTooltipText;
    private createTooltipFeatureIfNeeded;
    refreshToolTip(): void;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private getTooltipText;
    destroy(): void;
}
