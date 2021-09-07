import { ColumnGroupChild } from "../../../entities/columnGroupChild";
import { HeaderRowCtrl } from "../../headerRow/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    focus(): void;
}

export class HeaderCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: ColumnGroupChild, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

}
