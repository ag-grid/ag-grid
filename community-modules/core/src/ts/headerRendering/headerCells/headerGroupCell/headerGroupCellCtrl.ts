import { ColumnGroupChild } from "../../../entities/columnGroupChild";
import { HeaderRowCtrl } from "../../headerRow/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractHeaderCell/abstractHeaderCellCtrl";

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
    focus(): void;
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

}
