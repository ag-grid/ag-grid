// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { Beans } from "../beans";
import { RowCtrl } from "./rowCtrl";
export declare class RowComp extends Component {
    private fullWidthCellRenderer;
    private beans;
    private rowCtrl;
    private domOrder;
    private cellComps;
    constructor(ctrl: RowCtrl, beans: Beans, pinned: string | null);
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
}
