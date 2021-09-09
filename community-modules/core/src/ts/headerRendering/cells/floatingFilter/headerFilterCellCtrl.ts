
import { IHeaderColumn } from "../../../main";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";


export interface IHeaderFilterCellComp extends IAbstractHeaderCellComp {
}

export class HeaderFilterCellCtrl extends AbstractHeaderCellCtrl {

    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

    public setComp(comp: IHeaderFilterCellComp): void {
        super.setAbstractComp(comp);
    }
}
