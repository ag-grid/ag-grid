import { ColumnGroupChild } from "../../../main";
import { HeaderRowCtrl } from "../../headerRow/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";


export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
}

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

}
