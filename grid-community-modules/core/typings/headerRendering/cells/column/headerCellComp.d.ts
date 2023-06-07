import { Column, ColumnPinnedType } from "../../../entities/column";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class HeaderCellComp extends AbstractHeaderCellComp<HeaderCellCtrl> {
    private static TEMPLATE;
    private eResize;
    private eHeaderCompWrapper;
    protected readonly column: Column;
    protected readonly pinned: ColumnPinnedType;
    private headerComp;
    private headerCompGui;
    private headerCompVersion;
    constructor(ctrl: HeaderCellCtrl);
    private postConstruct;
    private destroyHeaderComp;
    private setUserCompDetails;
    private afterCompCreated;
}
