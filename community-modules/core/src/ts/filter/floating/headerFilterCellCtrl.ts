import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../../headerRendering/abstractHeaderCell/abstractHeaderCellCtrl";
import { HeaderRowCtrl } from "../../headerRendering/headerRow/headerRowCtrl";

export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
}

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

}
