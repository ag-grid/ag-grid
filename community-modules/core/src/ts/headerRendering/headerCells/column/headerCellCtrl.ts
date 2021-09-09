import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { HeaderRowCtrl } from "../../headerRow/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    focus(): void;
}

export class HeaderCellCtrl extends AbstractHeaderCellCtrl {

    private eGui: HTMLElement;

    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

    public setComp(comp: IHeaderCellComp, eGui: HTMLElement): void {
        super.setAbstractComp(comp);
        this.eGui = eGui;
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}
