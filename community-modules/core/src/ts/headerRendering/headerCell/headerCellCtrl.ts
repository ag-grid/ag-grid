import { ColumnGroupChild } from "../../entities/columnGroupChild";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractHeaderCell/abstractHeaderCellCtrl";
import { HeaderRowCtrl } from "../headerRow/headerRowCtrl";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    focus(): void;
}

export class HeaderCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

}
