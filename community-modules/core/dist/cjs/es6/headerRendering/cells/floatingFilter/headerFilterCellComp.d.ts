// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AbstractHeaderCellComp } from '../abstractCell/abstractHeaderCellComp';
import { HeaderFilterCellCtrl } from './headerFilterCellCtrl';
export declare class HeaderFilterCellComp extends AbstractHeaderCellComp<HeaderFilterCellCtrl> {
    private static TEMPLATE;
    private readonly eFloatingFilterBody;
    private readonly eButtonWrapper;
    private readonly eButtonShowMainFilter;
    private compPromise;
    constructor(ctrl: HeaderFilterCellCtrl);
    private postConstruct;
    private setCompDetails;
    private afterCompCreated;
}
