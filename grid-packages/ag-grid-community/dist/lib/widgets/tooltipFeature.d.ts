import { BeanStub } from "../context/beanStub";
import { Column } from "../entities/column";
import { ColumnGroup } from "../entities/columnGroup";
import { RowNode } from "../entities/rowNode";
import { Beans } from "../rendering/beans";
import { ITooltipParams } from "../rendering/tooltipComponent";
import { ColDef, ColGroupDef } from "../entities/colDef";
import { WithoutGridCommon } from "../interfaces/iCommon";
export interface ITooltipFeatureCtrl {
    getTooltipValue(): any;
    getGui(): HTMLElement;
    getLocation(): string;
    getColumn?(): Column | ColumnGroup;
    getColDef?(): ColDef | ColGroupDef;
    getRowIndex?(): number;
    getRowNode?(): RowNode;
    getValueFormatted?(): string;
}
export interface ITooltipFeatureComp {
    setTitle(title: string | undefined): void;
}
export declare class TooltipFeature extends BeanStub {
    private readonly ctrl;
    private readonly beans;
    private comp;
    private tooltip;
    private genericTooltipFeature;
    private browserTooltips;
    constructor(ctrl: ITooltipFeatureCtrl, beans: Beans);
    setComp(comp: ITooltipFeatureComp): void;
    private setupTooltip;
    private updateTooltipText;
    private createTooltipFeatureIfNeeded;
    refreshToolTip(): void;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private getTooltipText;
    destroy(): void;
}
