import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";

export interface IHeaderGroupCellComp extends IAbstractHeaderCellComp {
}

export class HeaderGroupCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

    public setComp(comp: IHeaderGroupCellComp, eGui: HTMLElement): void {
        super.setAbstractComp(comp, eGui);
    }
}
