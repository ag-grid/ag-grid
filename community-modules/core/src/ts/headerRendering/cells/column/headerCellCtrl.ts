import { IHeaderColumn } from "../../../entities/iHeaderColumn";
import { Events } from "../../../eventKeys";
import { HeaderRowCtrl } from "../../row/headerRowCtrl";
import { AbstractHeaderCellCtrl, IAbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellCtrl";
import { Autowired } from "../../../context/context";
import { ColumnModel } from "../../../columns/columnModel";

export interface IHeaderCellComp extends IAbstractHeaderCellComp {
    focus(): void;


    /// temp items
    refresh(): void;
}

export class HeaderCellCtrl extends AbstractHeaderCellCtrl {

    @Autowired('columnModel') private columnModel: ColumnModel;

    private eGui: HTMLElement;

    private colDefVersion: number;

    private comp: IHeaderCellComp;

    constructor(columnGroupChild: IHeaderColumn, parentRowCtrl: HeaderRowCtrl) {
        super(columnGroupChild, parentRowCtrl);
    }

    public setComp(comp: IHeaderCellComp, eGui: HTMLElement): void {
        super.setAbstractComp(comp);
        this.eGui = eGui;
        this.comp = comp;

        this.colDefVersion = this.columnModel.getColDefVersion();

        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    private onNewColumnsLoaded(): void {
        const colDefVersionNow = this.columnModel.getColDefVersion();
        if (colDefVersionNow != this.colDefVersion) {
            this.colDefVersion = colDefVersionNow;
            this.comp.refresh();
        }
    }
}
