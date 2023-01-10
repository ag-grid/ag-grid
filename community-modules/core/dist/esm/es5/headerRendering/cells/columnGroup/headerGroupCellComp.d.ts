// Type definitions for @ag-grid-community/core v29.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
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
