import { Component } from "../../widgets/component";
import { Beans } from "../beans";
import { RowCtrl } from "./rowCtrl";
import { RowContainerType } from "../../gridBodyComp/rowContainer/rowContainerCtrl";
export declare class RowComp extends Component {
    private fullWidthCellRenderer;
    private beans;
    private rowCtrl;
    private domOrder;
    private cellComps;
    constructor(ctrl: RowCtrl, beans: Beans, containerType: RowContainerType);
    private getInitialStyle;
    private showFullWidth;
    private setCellCtrls;
    private ensureDomOrder;
    private newCellComp;
    destroy(): void;
    private destroyAllCells;
    private setFullWidthRowComp;
    private getFullWidthCellRenderer;
    private destroyCells;
    private refreshFullWidth;
}
