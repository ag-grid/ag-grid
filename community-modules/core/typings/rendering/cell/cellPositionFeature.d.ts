import { CellCtrl } from "./cellCtrl";
import { Column } from "../../entities/column";
import { BeanStub } from "../../context/beanStub";
import { Beans } from "../beans";
/**
 * Takes care of:
 *  #) Cell Width (including when doing cell spanning, which makes width cover many columns)
 *  #) Cell Height (when doing row span, otherwise we don't touch the height as it's just row height)
 *  #) Cell Left (the horizontal positioning of the cell, the vertical positioning is on the row)
 */
export declare class CellPositionFeature extends BeanStub {
    private cellCtrl;
    private eGui;
    private readonly column;
    private readonly rowNode;
    private colsSpanning;
    private rowSpan;
    private beans;
    constructor(ctrl: CellCtrl, beans: Beans);
    private setupRowSpan;
    setComp(eGui: HTMLElement): void;
    private onDisplayColumnsChanged;
    private setupColSpan;
    onWidthChanged(): void;
    private getCellWidth;
    getColSpanningList(): Column[];
    onLeftChanged(): void;
    private getCellLeft;
    private modifyLeftForPrintLayout;
    private applyRowSpan;
    destroy(): void;
}
