import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { ITooltipParams, TooltipLocation } from '../rendering/tooltipComponent';
export interface ITooltipFeatureCtrl {
    getTooltipValue(): any;
    getGui(): HTMLElement;
    getLocation(): TooltipLocation;
    getColumn?(): AgColumn | AgColumnGroup;
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
    private beans;
    wireBeans(beans: BeanCollection): void;
    private tooltip;
    private tooltipManager;
    private browserTooltips;
    constructor(ctrl: ITooltipFeatureCtrl, beans?: BeanCollection);
    postConstruct(): void;
    private setBrowserTooltip;
    private updateTooltipText;
    private createTooltipFeatureIfNeeded;
    refreshToolTip(): void;
    getTooltipParams(): WithoutGridCommon<ITooltipParams>;
    private getTooltipText;
    destroy(): void;
}
