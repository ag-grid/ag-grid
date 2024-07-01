import type { BeanCollection } from '../../context/context';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import { Component } from '../../widgets/component';
import type { RowCtrl } from './rowCtrl';
export declare class RowComp extends Component {
    private fullWidthCellRenderer;
    private beans;
    private rowCtrl;
    private domOrder;
    private cellComps;
    constructor(ctrl: RowCtrl, beans: BeanCollection, containerType: RowContainerType);
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
