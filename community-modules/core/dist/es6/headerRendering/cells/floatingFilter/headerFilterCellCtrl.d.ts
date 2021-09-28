// Type definitions for @ag-grid-community/core v26.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { Column } from "../../../entities/column";
export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
}
export declare class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {
    constructor(column: Column, parentRowCtrl: HeaderRowCtrl);
    setComp(comp: IHeaderFilterCellComp, eGui: HTMLElement): void;
}
