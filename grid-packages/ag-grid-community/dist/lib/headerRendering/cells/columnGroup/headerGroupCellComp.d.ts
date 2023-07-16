import { AbstractHeaderCellComp } from "../abstractCell/abstractHeaderCellComp";
import { HeaderGroupCellCtrl } from "./headerGroupCellCtrl";
export declare class HeaderGroupCellComp extends AbstractHeaderCellComp<HeaderGroupCellCtrl> {
    private static TEMPLATE;
    private userComponentFactory;
    private eResize;
    constructor(ctrl: HeaderGroupCellCtrl);
    private postConstruct;
    private setUserCompDetails;
    private afterHeaderCompCreated;
}
