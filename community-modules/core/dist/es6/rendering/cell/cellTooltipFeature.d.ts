// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
import { CellCtrl, ICellComp } from "./cellCtrl";
import { Beans } from "../beans";
import { ITooltipParams } from "../tooltipComponent";
export declare class CellTooltipFeature extends BeanStub {
    private readonly cellCtrl;
    private readonly column;
    private readonly rowNode;
    private readonly beans;
    private cellComp;
    private tooltip;
    private tooltipSanatised;
    private genericTooltipFeature;
    private browserTooltips;
    constructor(ctrl: CellCtrl, beans: Beans);
    setComp(comp: ICellComp): void;
    private setupTooltip;
    private updateTooltipText;
    private createTooltipFeatureIfNeeded;
    refreshToolTip(): void;
    private getToolTip;
    getTooltipParams(): ITooltipParams;
    private getTooltipText;
    destroy(): void;
}
