import { Column } from "../../../entities/column";
import { Beans } from "../../../rendering/beans";
import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderCellCtrl } from "./headerCellCtrl";
export declare class HeaderCellComp extends AbstractHeaderCellComp<HeaderCellCtrl> {
    private static TEMPLATE;
    private userComponentFactory;
    protected beans: Beans;
    private eResize;
    protected readonly column: Column;
    protected readonly pinned: string | null;
    private headerComp;
    private headerCompGui;
    private headerCompVersion;
    constructor(ctrl: HeaderCellCtrl);
    private postConstruct;
    private destroyHeaderComp;
    private setUserCompDetails;
    private afterHeaderCompCreated;
}
